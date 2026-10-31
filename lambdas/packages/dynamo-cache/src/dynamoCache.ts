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

// A disposable table: it is created on first use, so it can be deleted at any time to clear the cache
export type DynamoCacheTable = {
  tableName: string;
  keyName: string; // String partition key
};

const MAX_ITEMS_PER_BATCH_WRITE = 25; // 25 is max allowed by AWS
const TABLE_CREATION_REQUEST_INTERVAL_MILLISECONDS = 60 * 1000;

// When this container last asked for each table to be created (epoch milliseconds), so it doesn't ask on every call
const tableCreationRequestTimes: Record<string, number | undefined> = {};

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

const requestTableCreation = async ({ tableName, keyName }: DynamoCacheTable) => {
  const lastRequestTime = tableCreationRequestTimes[tableName];
  if (
    lastRequestTime !== undefined &&
    Date.now() - lastRequestTime < TABLE_CREATION_REQUEST_INTERVAL_MILLISECONDS
  )
    return;
  tableCreationRequestTimes[tableName] = Date.now();

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
    // Another Lambda is already creating it
    if (!(e instanceof ResourceInUseException)) throw e;
  }
};

/**
 * Runs the operation. If the table doesn't exist, asks for it to be created and rethrows
 * without waiting for it, so callers can skip the cache until the table is ready.
 */
const withTable = async <T>(
  table: DynamoCacheTable,
  operation: () => Promise<T>,
): Promise<T> => {
  try {
    return await operation();
  } catch (e) {
    if (e instanceof ResourceNotFoundException) await requestTableCreation(table);
    throw e;
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

/**
 * Tries to take the lock named lockName, stored as an item in the table, for durationSeconds.
 * Returns whether it was taken. The lock isn't released, it just expires.
 */
export const acquireLock = async (
  table: DynamoCacheTable,
  lockName: string,
  durationSeconds: number,
): Promise<boolean> =>
  withTable(table, async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    try {
      await getDocumentClient().send(
        new PutCommand({
          TableName: table.tableName,
          Item: { [table.keyName]: lockName, expiresAt: nowSeconds + durationSeconds },
          ConditionExpression: 'attribute_not_exists(#key) OR expiresAt < :now',
          ExpressionAttributeNames: { '#key': table.keyName },
          ExpressionAttributeValues: { ':now': nowSeconds },
        }),
      );
      return true;
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException) return false;
      throw e;
    }
  });
