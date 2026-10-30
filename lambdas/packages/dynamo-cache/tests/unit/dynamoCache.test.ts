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
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoCacheTable, getCachedItem, putCachedItems } from '../../src';

const TABLE: DynamoCacheTable = { tableName: 'Test-Table', keyName: 'id' };

const tableNotFound = () =>
  new ResourceNotFoundException({ message: 'Table not found', $metadata: {} });

// Fakes DynamoDB: the table exists once tableExists is true, or once it is created
const mockDynamoDb = ({
  tableExists,
  item,
  createTableError,
}: {
  tableExists: boolean;
  item?: Record<string, unknown>;
  createTableError?: Error;
}) => {
  let exists = tableExists;
  const handle = async (command: unknown) => {
    if (command instanceof CreateTableCommand) {
      exists = true;
      if (createTableError) throw createTableError;
      return {};
    }
    if (command instanceof DescribeTableCommand) {
      return { Table: { TableStatus: 'ACTIVE' } };
    }
    if (!exists) throw tableNotFound();
    if (command instanceof GetCommand) return { Item: item };
    if (command instanceof BatchWriteCommand) return {};
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

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getCachedItem', () => {
  test('returns the stored item for the key', async () => {
    const { documentSend } = mockDynamoDb({
      tableExists: true,
      item: { id: 'A', value: 1 },
    });

    expect(await getCachedItem(TABLE, 'A')).toStrictEqual({ id: 'A', value: 1 });
    expect(sentCommands(documentSend)[0].input).toStrictEqual({
      TableName: 'Test-Table',
      Key: { id: 'A' },
    });
  });

  test('returns undefined when the key is not stored', async () => {
    mockDynamoDb({ tableExists: true });

    expect(await getCachedItem(TABLE, 'A')).toBeUndefined();
  });

  test('creates the table with the key as string partition key when it does not exist', async () => {
    const { dynamoDbSend } = mockDynamoDb({ tableExists: false });

    expect(await getCachedItem(TABLE, 'A')).toBeUndefined();

    const createTable = sentCommands(dynamoDbSend).find(
      command => command instanceof CreateTableCommand,
    );
    expect(createTable.input).toStrictEqual({
      TableName: 'Test-Table',
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  test('waits for the table when another Lambda is already creating it', async () => {
    mockDynamoDb({
      tableExists: false,
      item: { id: 'A' },
      createTableError: new ResourceInUseException({ message: 'In use', $metadata: {} }),
    });

    expect(await getCachedItem(TABLE, 'A')).toStrictEqual({ id: 'A' });
  });
});

describe('putCachedItems', () => {
  const batchWrites = (send: jest.SpyInstance) =>
    sentCommands(send).filter(command => command instanceof BatchWriteCommand);

  test('stores the items in batches of at most 25', async () => {
    const { documentSend } = mockDynamoDb({ tableExists: true });
    const items = Array.from({ length: 30 }, (_, i) => ({ id: `A${i}` }));

    await putCachedItems(TABLE, items);

    const batches = batchWrites(documentSend).map(
      command => command.input.RequestItems['Test-Table'],
    );
    expect(batches.map(batch => batch.length)).toEqual([25, 5]);
    expect(batches.flat()).toEqual(items.map(item => ({ PutRequest: { Item: item } })));
  });

  test('creates the table if it does not exist, then stores the items', async () => {
    const { dynamoDbSend, documentSend } = mockDynamoDb({ tableExists: false });

    await putCachedItems(TABLE, [{ id: 'A' }]);

    expect(
      sentCommands(dynamoDbSend).filter(command => command instanceof CreateTableCommand),
    ).toHaveLength(1);
    // The first attempt fails because the table is missing, the retry stores the item
    expect(batchWrites(documentSend)).toHaveLength(2);
  });
});
