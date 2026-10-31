/**
 * Copyright (C) 2021-2025 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import {
  ConditionalCheckFailedException,
  CreateTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { acquireLock, DynamoCacheTable, getCachedItem, putCachedItems } from '../../src';

// Each test uses its own table, since the package remembers when it asked to create one
let tableCount = 0;
const newTable = (): DynamoCacheTable => {
  tableCount += 1;
  return { tableName: `Test-Table-${tableCount}`, keyName: 'id' };
};

const NOW_SECONDS = 1_800_000_000;

// Fakes DynamoDB. Creating the table doesn't make it available straight away, like the real one
const mockDynamoDb = ({
  tableExists,
  item,
  createTableError,
  isLockTaken = false,
}: {
  tableExists: boolean;
  item?: Record<string, unknown>;
  createTableError?: Error;
  isLockTaken?: boolean;
}) => {
  const handle = async (command: unknown) => {
    if (command instanceof CreateTableCommand) {
      if (createTableError) throw createTableError;
      return {};
    }
    if (!tableExists) {
      throw new ResourceNotFoundException({ message: 'Table not found', $metadata: {} });
    }
    if (command instanceof GetCommand) return { Item: item };
    if (command instanceof BatchWriteCommand) return {};
    if (command instanceof PutCommand) {
      if (isLockTaken) {
        throw new ConditionalCheckFailedException({ message: 'Taken', $metadata: {} });
      }
      return {};
    }
    throw new Error('Unexpected command');
  };
  const dynamoDbSend = jest
    .spyOn(DynamoDBClient.prototype, 'send')
    .mockImplementation(handle as any);
  const documentSend = jest
    .spyOn(DynamoDBDocumentClient.prototype, 'send')
    .mockImplementation(handle as any);
  return { dynamoDbSend, documentSend };
};

const sentCommands = (send: jest.SpyInstance) =>
  send.mock.calls.map(([command]) => command);

const createTableCommands = (send: jest.SpyInstance) =>
  sentCommands(send).filter(command => command instanceof CreateTableCommand);

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(NOW_SECONDS * 1000);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getCachedItem', () => {
  test('returns the stored item for the key', async () => {
    const table = newTable();
    const { documentSend } = mockDynamoDb({
      tableExists: true,
      item: { id: 'A', value: 1 },
    });

    expect(await getCachedItem(table, 'A')).toStrictEqual({ id: 'A', value: 1 });
    expect(sentCommands(documentSend)[0].input).toStrictEqual({
      TableName: table.tableName,
      Key: { id: 'A' },
    });
  });

  test('returns undefined when the key is not stored', async () => {
    mockDynamoDb({ tableExists: true });

    expect(await getCachedItem(newTable(), 'A')).toBeUndefined();
  });

  test('asks for the table to be created and throws, without waiting, when it does not exist', async () => {
    const table = newTable();
    const { dynamoDbSend } = mockDynamoDb({ tableExists: false });

    await expect(getCachedItem(table, 'A')).rejects.toThrow(ResourceNotFoundException);

    expect(createTableCommands(dynamoDbSend).map(command => command.input)).toEqual([
      {
        TableName: table.tableName,
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      },
    ]);
  });

  test('throws the missing table error when another Lambda is already creating it', async () => {
    mockDynamoDb({
      tableExists: false,
      createTableError: new ResourceInUseException({ message: 'In use', $metadata: {} }),
    });

    await expect(getCachedItem(newTable(), 'A')).rejects.toThrow(
      ResourceNotFoundException,
    );
  });

  test('asks for the table to be created at most once a minute', async () => {
    const table = newTable();
    const { dynamoDbSend } = mockDynamoDb({ tableExists: false });

    await expect(getCachedItem(table, 'A')).rejects.toThrow();
    await expect(getCachedItem(table, 'A')).rejects.toThrow();
    expect(createTableCommands(dynamoDbSend)).toHaveLength(1);

    (Date.now as jest.Mock).mockReturnValue((NOW_SECONDS + 61) * 1000);
    await expect(getCachedItem(table, 'A')).rejects.toThrow();
    expect(createTableCommands(dynamoDbSend)).toHaveLength(2);
  });
});

describe('putCachedItems', () => {
  const batchWrites = (send: jest.SpyInstance) =>
    sentCommands(send).filter(command => command instanceof BatchWriteCommand);

  test('stores the items in batches of at most 25', async () => {
    const table = newTable();
    const { documentSend } = mockDynamoDb({ tableExists: true });
    const items = Array.from({ length: 30 }, (_, i) => ({ id: `A${i}` }));

    await putCachedItems(table, items);

    const batches = batchWrites(documentSend).map(
      command => command.input.RequestItems[table.tableName],
    );
    expect(batches.map(batch => batch.length)).toEqual([25, 5]);
    expect(batches.flat()).toEqual(items.map(item => ({ PutRequest: { Item: item } })));
  });

  test('asks for the table to be created and throws when it does not exist', async () => {
    const { dynamoDbSend } = mockDynamoDb({ tableExists: false });

    await expect(putCachedItems(newTable(), [{ id: 'A' }])).rejects.toThrow(
      ResourceNotFoundException,
    );
    expect(createTableCommands(dynamoDbSend)).toHaveLength(1);
  });
});

describe('acquireLock', () => {
  test('takes the lock if it is free or expired, until it expires', async () => {
    const table = newTable();
    const { documentSend } = mockDynamoDb({ tableExists: true });

    expect(await acquireLock(table, 'lock:test', 30)).toBe(true);
    expect(sentCommands(documentSend)[0].input).toStrictEqual({
      TableName: table.tableName,
      Item: { id: 'lock:test', expiresAt: NOW_SECONDS + 30 },
      ConditionExpression: 'attribute_not_exists(#key) OR expiresAt < :now',
      ExpressionAttributeNames: { '#key': 'id' },
      ExpressionAttributeValues: { ':now': NOW_SECONDS },
    });
  });

  test('returns false when another caller holds the lock', async () => {
    mockDynamoDb({ tableExists: true, isLockTaken: true });

    expect(await acquireLock(newTable(), 'lock:test', 30)).toBe(false);
  });
});
