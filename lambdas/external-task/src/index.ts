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
import { isErr } from '@tech-matters/result-type';
import {
  getMasterWorkflowSid,
  getSyncServiceSid,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { channelTypes } from '@tech-matters/twilio-types';
import type { DocumentInstance } from 'twilio/lib/rest/sync/v1/service/document';
import { authenticateWithExternalApiKey } from './requestValidator';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
};

const handleError = (message: string, error?: Error, statusCode = 500): ALBResult => {
  if (error) {
    console.error(message, error);
  } else {
    console.error(message);
  }
  return {
    statusCode,
    headers,
    body: JSON.stringify({ message, error: error?.message }),
  };
};

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  console.debug('[SENSITIVE] triggered with event', event);

  // TODO: validate API key
  const validationResult = await authenticateWithExternalApiKey({ event });

  if (isErr(validationResult)) {
    return handleError(
      validationResult.message,
      validationResult.error.cause,
      validationResult.error.statusCode,
    );
  }

  const { accountSid } = validationResult.data;

  if (event.httpMethod === 'POST') {
    if (!event.body) {
      return handleError('Event body is null or undefined', undefined, 400);
    }

    let dedupDocument: DocumentInstance | null = null;

    try {
      const twilioClient = await getTwilioClient(accountSid);

      const body = JSON.parse(event.body);
      const externalId = body.externalId;
      if (!externalId) {
        const message = 'No externalId property found on trigger payload';
        console.warn(message);
        return handleError(message, undefined, 400);
      }

      const dedupDocumentName = `external-task-${externalId}`;

      console.debug(`Creating dedupDocument with name ${dedupDocumentName}`);
      const syncService = await getSyncServiceSid(accountSid);
      dedupDocument = await twilioClient.sync.v1.services(syncService).documents.create({
        ttl: 86400, // one day
        uniqueName: dedupDocumentName,
      });

      const workspaceSid = await getWorkspaceSid(accountSid);
      const workflowSid = await getMasterWorkflowSid(accountSid);

      const createdTask = await twilioClient.taskrouter.v1
        .workspaces(workspaceSid)
        .tasks.create({
          taskChannel: channelTypes.EXTERNAL_TASK,
          workflowSid,
          attributes: JSON.stringify({
            external_task_attributes: { externalId },
            from: 'Placeholder',
            name: 'Placeholder',
            channelType: channelTypes.EXTERNAL_TASK,
            customChannelType: channelTypes.EXTERNAL_TASK,
            ignoreAgent: '',
            transferTargetType: '',
          }),
        });

      console.debug('[SENSITIVE] Created external task', createdTask);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ taskSid: createdTask.sid }),
      };
    } catch (error) {
      const message = 'Error handling the POST request';
      console.error(message, error);

      if (dedupDocument) {
        await dedupDocument.remove();
      }

      return handleError(message, error as Error);
    }
  } else if (event.httpMethod === 'OPTIONS') {
    // Handle preflight CORS requests
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Handle unsupported HTTP methods
  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Error: Method Not Allowed' }),
  };
};
