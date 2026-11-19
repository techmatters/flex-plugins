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
import { isValidTwilioRequest } from './requestValidator';
import { filterSensitiveData, isJsonObject } from './attributeFilterer';
import type { JsonValue } from './attributeFilterer';
import { client, v2 } from '@datadog/datadog-api-client';
import { getSsmParameter } from '@tech-matters/ssm-cache';

import { publishSns } from './snsClient';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
};

// Define a helper function to handle errors
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

let apiInstance: v2.LogsApi;

const getApi = async () => {
  if (!apiInstance) {
    const datadogApiKey: string = await getSsmParameter(
      '/infrastructure-config/twilio-event-streams/datadog/api_key',
    );
    const datadogAppKey: string = await getSsmParameter(
      '/infrastructure-config/twilio-event-streams/datadog/app_key',
    );
    const datadogSite = 'datadoghq.com';
    const configurationOpts = {
      authMethods: {
        apiKeyAuth: datadogApiKey,
        appKeyAuth: datadogAppKey,
      },
    };
    const configuration = client.createConfiguration(configurationOpts);
    configuration.setServerVariables({
      site: datadogSite,
    });
    apiInstance = new v2.LogsApi(configuration);
  }
  return apiInstance;
};

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  const { httpMethod, body: bodyJson } = event;
  if (httpMethod === 'POST') {
    if (!bodyJson) {
      return handleError('Event body is null or undefined');
    }

    try {
      const streamEvents: JsonValue = JSON.parse(bodyJson);
      if (!Array.isArray(streamEvents)) {
        return handleError('Event body is not an array of events', undefined, 400);
      }
      // Access the account_sid value
      const [firstEvent] = streamEvents;
      const eventData = isJsonObject(firstEvent) ? firstEvent.data : undefined;
      const accountSid = isJsonObject(eventData)
        ? eventData.account_sid || eventData.accountSid
        : undefined;
      if (typeof accountSid !== 'string' || !accountSid) {
        return handleError('Account SID is missing in the event body');
      }

      // Find the parameter name and get the auth token
      const paramName = `/${process.env.NODE_ENV}/twilio/${accountSid}/auth_token`;
      if (!paramName) {
        return handleError('Parameter name not found for account SID');
      }

      const authToken = await getSsmParameter(paramName);
      if (!authToken) {
        return handleError('Auth token not found');
      }

      // Validate Twilio request
      const validRequest = isValidTwilioRequest(authToken, event);
      const sentToDatadog = async () => {
        // Mask helpseeker data (task attributes, contact addresses, phone numbers, error
        // logs). Only after the request is validated, so unsigned requests can't make it run.
        const maskedEvent = filterSensitiveData(firstEvent);
        const params = {
          body: [
            {
              ddsource: 'twilio',
              ddtags: '',
              hostname: '',
              message: JSON.stringify(maskedEvent),
              service: 'twilio-event-stream',
            },
          ],
        };
        const api = await getApi();
        try {
          await api.submitLog(params);
        } catch (error) {
          console.error('Error posting to Datadog', error);
        }
      };

      const publishToSns = async () => {
        if (process.env.TWILIO_EVENTS_TOPIC_ARN) {
          try {
            await publishSns({
              topicArn: process.env.TWILIO_EVENTS_TOPIC_ARN,
              message: bodyJson,
            });
          } catch (error) {
            console.error('Error posting to SNS topic', error);
          }
        } else {
          console.warn('TWILIO_EVENTS_TOPIC_ARN not set, cannot publish to SNS');
        }
      };

      if (validRequest) {
        await Promise.all([sentToDatadog(), publishToSns()]);

        return {
          statusCode: 200,
          headers,
          body: '',
        };
      } else {
        return handleError(
          'Invalid Request',
          new Error('Signature verification failed'),
          403,
        );
      }
    } catch (error) {
      return handleError('Error handling the POST request', error as Error);
    }
  } else if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Error: Method Not Allowed' }),
  };
};
