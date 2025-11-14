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

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { WebhookRecord } from './types';
const WEBHOOK_RECORDS_TABLE_NAME = 'webhook-requests';

const getDynamoDBClient = (): DynamoDBDocumentClient => {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    ...(process.env.DYNAMODB_ENDPOINT && {
      endpoint: process.env.DYNAMODB_ENDPOINT,
    }),
  });

  return DynamoDBDocumentClient.from(client);
};

let dynamoDbClient: DynamoDBDocumentClient;

const getClient = (): DynamoDBDocumentClient => {
  if (!dynamoDbClient) {
    dynamoDbClient = getDynamoDBClient();
  }
  return dynamoDbClient;
};

/**
 * Records a webhook request in DynamoDB
 */
export const recordWebhook = async (record: WebhookRecord): Promise<void> => {
  const client = getClient();

  const command = new PutCommand({
    TableName: WEBHOOK_RECORDS_TABLE_NAME,
    Item: {
      sessionId: record.sessionId,
      timestamp: record.timestamp,
      path: record.path,
      method: record.method,
      headers: record.headers,
      body: record.body,
      expiryTime: Date.now() + 1000 * 60 * 60 * 24 * 7,
    },
  });

  await client.send(command);
};

/**
 * Retrieves all webhook records for a given sessionId
 */
export const retrieveWebhooks = async (sessionId: string): Promise<WebhookRecord[]> => {
  const client = getClient();

  const command = new QueryCommand({
    TableName: WEBHOOK_RECORDS_TABLE_NAME,
    KeyConditionExpression: 'sessionId = :sessionId',
    ExpressionAttributeValues: {
      ':sessionId': sessionId,
    },
    ScanIndexForward: true, // Sort by timestamp ascending
  });

  const response = await client.send(command);
  return (response.Items || []) as WebhookRecord[];
};

/**
 * Deletes all webhook records for a given sessionId
 * Returns the count of deleted items
 */
export const deleteWebhooks = async (sessionId: string): Promise<number> => {
  const client = getClient();

  // First, query to get all items for this sessionId
  const queryCommand = new QueryCommand({
    TableName: WEBHOOK_RECORDS_TABLE_NAME,
    KeyConditionExpression: 'sessionId = :sessionId',
    ExpressionAttributeValues: {
      ':sessionId': sessionId,
    },
    ProjectionExpression: 'sessionId, #ts',
    ExpressionAttributeNames: {
      '#ts': 'timestamp',
    },
  });

  const queryResponse = await client.send(queryCommand);
  const items = (queryResponse.Items || []) as WebhookRecord[];

  if (items.length === 0) {
    return 0;
  }

  // DynamoDB BatchWriteCommand can delete up to 25 items at a time
  const batchSize = 25;
  let deletedCount = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const deleteRequests = batch.map(item => ({
      DeleteRequest: {
        Key: {
          sessionId: item.sessionId,
          timestamp: item.timestamp,
        },
      },
    }));

    const batchWriteCommand = new BatchWriteCommand({
      RequestItems: {
        [WEBHOOK_RECORDS_TABLE_NAME]: deleteRequests,
      },
    });

    await client.send(batchWriteCommand);
    deletedCount += batch.length;
  }

  return deletedCount;
};
