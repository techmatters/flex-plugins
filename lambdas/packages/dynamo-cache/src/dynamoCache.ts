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
  DynamoDBClient,
  ResourceInUseException,
  ResourceNotFoundException,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

// A disposable table: it is created on first use, so it can be deleted at any time to clear the cache
export type DynamoCacheTable = {
  tableName: string;
  keyName: string; // String partition key
};

const TABLE_CREATION_MAX_WAIT_SECONDS = 60;
const MAX_ITEMS_PER_BATCH_WRITE = 25; // 25 is max allowed by AWS

let dynamoDbClient: DynamoDBClient;
let documentClient: DynamoDBDocumentClient;

const getDynamoDbClient = () => {
  if (!dynamoDbClient) {
    dynamoDbClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      ...(process.env.DYNAMODB_ENDPOINT && {
        endpoint: process.env.DYNAMODB_ENDPOINT,
      }),
    });
  }
  return dynamoDbClient;
};

const getDocumentClient = () => {
  if (!documentClient) {
    documentClient = DynamoDBDocumentClient.from(getDynamoDbClient());
  }
  return documentClient;
};

const createTable = async ({ tableName, keyName }: DynamoCacheTable) => {
  try {
    await getDynamoDbClient().send(
      new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [{ AttributeName: keyName, AttributeType: 'S' }],
        KeySchema: [{ AttributeName: keyName, KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
  } catch (e) {
    // Another Lambda is already creating it, so just wait for it below
    if (!(e instanceof ResourceInUseException)) throw e;
  }
  await waitUntilTableExists(
    { client: getDynamoDbClient(), maxWaitTime: TABLE_CREATION_MAX_WAIT_SECONDS },
    { TableName: tableName },
  );
};

// Runs the operation, creating the table and retrying once if it doesn't exist yet
const withTable = async <T>(
  table: DynamoCacheTable,
  operation: () => Promise<T>,
): Promise<T> => {
  try {
    return await operation();
  } catch (e) {
    if (!(e instanceof ResourceNotFoundException)) throw e;
    await createTable(table);
    return operation();
  }
};

export const getCachedItem = async <T>(
  table: DynamoCacheTable,
  keyValue: string,
): Promise<T | undefined> =>
  withTable(table, async () => {
    const { Item } = await getDocumentClient().send(
      new GetCommand({ TableName: table.tableName, Key: { [table.keyName]: keyValue } }),
    );
    return Item as T | undefined;
  });

// Items left unprocessed by DynamoDB (e.g. when throttled) are not retried, since this is only a cache
export const putCachedItems = async <T extends Record<string, unknown>>(
  table: DynamoCacheTable,
  items: T[],
): Promise<void> => {
  const batches = Array.from(
    { length: Math.ceil(items.length / MAX_ITEMS_PER_BATCH_WRITE) },
    (_, i) =>
      items.slice(i * MAX_ITEMS_PER_BATCH_WRITE, (i + 1) * MAX_ITEMS_PER_BATCH_WRITE),
  );

  await withTable(table, async () => {
    const promises = batches.map(batch =>
      getDocumentClient().send(
        new BatchWriteCommand({
          RequestItems: {
            [table.tableName]: batch.map(item => ({ PutRequest: { Item: item } })),
          },
        }),
      ),
    );
    await Promise.all(promises);
  });
};
