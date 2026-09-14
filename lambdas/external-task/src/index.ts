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
import type { DocumentInstance } from 'twilio/lib/rest/sync/v1/service/document';
import { isErr } from '@tech-matters/result-type';
import {
  getMasterWorkflowSid,
  getSyncServiceSid,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { channelTypes } from '@tech-matters/twilio-types';
import { authenticateWithExternalApiKey } from './requestValidator';
import { getExternalTaskMapping } from './mappings';

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

// TODO: factor out to share with account-scoped lambda?
const parseBody = ({
  body,
  contentTypeHeader,
  isBase64Encoded,
}: {
  contentTypeHeader: string | null;
  body: string | null;
  isBase64Encoded: boolean;
}) => {
  if (!body || !contentTypeHeader) {
    return body;
  }

  // if (contentTypeHeader.includes('application/x-www-form-urlencoded')) {
  //   if (isBase64Encoded) {
  //     const data = Buffer.from(body, 'base64').toString();
  //     return qs.parse(data);
  //   }

  //   return qs.parse(body);
  // }

  if (contentTypeHeader === 'application/json') {
    if (isBase64Encoded) {
      const data = Buffer.from(body, 'base64').toString();
      return JSON.parse(data);
    }

    return JSON.parse(body || 'null');
  }
};

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  try {
    console.debug('[SENSITIVE] triggered with event', event);

    const validationResult = await authenticateWithExternalApiKey({ event });

    if (isErr(validationResult)) {
      return handleError(
        validationResult.message,
        validationResult.error.cause,
        validationResult.error.statusCode,
      );
    }

    const { accountSid, accountShortCode } = validationResult.data;

    if (event.httpMethod === 'POST') {
      if (!event.body) {
        return handleError('Event body is null or undefined', undefined, 400);
      }

      let dedupDocument: DocumentInstance | null = null;
      const twilioClient = await getTwilioClient(accountSid);
      const syncService = await getSyncServiceSid(accountSid);

      try {
        const body = parseBody({
          body: event.body,
          contentTypeHeader: event.headers?.['content-type'] || null,
          isBase64Encoded: event.isBase64Encoded,
        });

        const mappingResult = getExternalTaskMapping({ accountShortCode })(body);
        if (isErr(mappingResult)) {
          return handleError(mappingResult.message, mappingResult.error, 400);
        }

        const { externalId, externalTaskAttributes } = mappingResult.unwrap();

        const dedupDocumentName = `external-task-${externalId}`;

        console.debug(`Creating dedupDocument with name ${dedupDocumentName}`);
        dedupDocument = await twilioClient.sync.v1
          .services(syncService)
          .documents.create({
            ttl: 86400, // one day
            uniqueName: dedupDocumentName,
          });

        const workspaceSid = await getWorkspaceSid(accountSid);
        const workflowSid = await getMasterWorkflowSid(accountSid);
        const createdTask = await twilioClient.taskrouter.v1
          .workspaces(workspaceSid)
          .tasks.create({
            taskChannel: channelTypes.EXTERNAL,
            workflowSid,
            attributes: JSON.stringify({
              externalId,
              externalTaskAttributes,
              from: 'Placeholder',
              name: 'Placeholder',
              channelType: channelTypes.EXTERNAL,
              customChannelType: channelTypes.EXTERNAL,
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
        if (dedupDocument) {
          try {
            console.debug(`Removing dedupDocument ${JSON.stringify(dedupDocument)}`);
            await twilioClient.sync.v1
              .services(syncService)
              .documents(dedupDocument.sid)
              .remove();
          } catch (err) {
            console.error(`Failed removing dedupDocument`);
          }
        }

        // bubble up
        throw error;
      }
    }

    if (event.httpMethod === 'OPTIONS') {
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
  } catch (error) {
    const message = 'Error handling request';
    return handleError(message, error as Error);
  }
};
