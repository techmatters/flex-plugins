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

import type { ALBEvent, ALBResult } from 'aws-lambda';
import {
  WebhookResponse,
  WebhookRecord,
  WebhookRecordResponse,
  WebhookDeleteResponse,
  ISO8601UTCDateString,
} from './types';
import { recordWebhook, retrieveWebhooks, deleteWebhooks } from './dynamoDbClient';

const createResponse = (statusCode: number, body: WebhookResponse): ALBResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Webhook-Receiver-Session-Id',
    },
    body: JSON.stringify(body),
  };
};

const createErrorResponse = (statusCode: number, message: string): ALBResult => {
  return createResponse(statusCode, {
    message,
  });
};

const getSessionIdFromRequest = (event: ALBEvent): string | null => {
  // Try to get sessionId from custom header first
  const headersessionId = event.headers?.['x-webhook-receiver-session-id'];
  if (headersessionId) {
    return headersessionId;
  }

  // Try to get from query parameters
  const querysessionId = event.queryStringParameters?.sessionId;
  if (querysessionId) {
    return querysessionId;
  }

  return null;
};

const handleRecordOperation = async (
  event: ALBEvent,
  sessionId: string,
): Promise<ALBResult> => {
  try {
    const timestamp = new Date().toISOString() as ISO8601UTCDateString;
    const headers: Record<string, string | undefined> = event.headers ?? {};
    const body = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString()
      : event.body || '';

    const record: WebhookRecord = {
      sessionId,
      timestamp,
      path: event.path,
      method: event.httpMethod,
      headers,
      body,
    };

    await recordWebhook(record);

    const response: WebhookRecordResponse = {
      message: 'Webhook recorded successfully',
    };

    return createResponse(200, response);
  } catch (error: any) {
    console.error('Error recording webhook:', error);
    return createErrorResponse(500, `Failed to record webhook: ${error.message}`);
  }
};

const handleRetrieveOperation = async (sessionId: string): Promise<ALBResult> => {
  try {
    const records = await retrieveWebhooks(sessionId);

    const response: WebhookRecord[] = records;

    return createResponse(200, response);
  } catch (error: any) {
    console.error('Error retrieving webhooks:', error);
    return createErrorResponse(500, `Failed to retrieve webhooks: ${error.message}`);
  }
};

const handleDeleteOperation = async (sessionId: string): Promise<ALBResult> => {
  try {
    const deletedCount = await deleteWebhooks(sessionId);

    const response: WebhookDeleteResponse = {
      message: `Successfully deleted ${deletedCount} webhook record(s)`,
      deletedCount,
    };

    return createResponse(200, response);
  } catch (error: any) {
    console.error('Error deleting webhooks:', error);
    return createErrorResponse(500, `Failed to delete webhooks: ${error.message}`);
  }
};

/**
 * Main handler for webhook receiver operations
 * Determines operation based on HTTP method and request body
 */
export const handleWebhookReceiver = async (event: ALBEvent): Promise<ALBResult> => {
  console.info('Webhook receiver event:', JSON.stringify(event, null, 2));

  // Handle OPTIONS for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {
      message: 'CORS preflight',
    });
  }

  const sessionId = getSessionIdFromRequest(event);

  if (!sessionId) {
    return createErrorResponse(
      400,
      'sessionId is required. Provide it via X-List-Id header, query parameter, or request body',
    );
  }

  // Determine operation from request body or HTTP method
  let operation =
    event.headers?.['x-webhook-receiver-operation'] ??
    event.queryStringParameters?.webhookReceiverOperation ??
    'RECORD';

  console.log(`Processing ${operation} operation for sessionId: ${sessionId}`);

  switch (operation) {
    case 'RECORD':
      return handleRecordOperation(event, sessionId);
    case 'RETRIEVE':
      return handleRetrieveOperation(sessionId);
    case 'DELETE':
      return handleDeleteOperation(sessionId);
    default:
      return createErrorResponse(400, `Unknown operation: ${operation}`);
  }
};
