import type { ALBEvent, ALBResult } from 'aws-lambda';
import { isValidTwilioRequest } from './requestValidator';
import { removeAttributes, redactSensitiveAttributes } from './attributeFilterer';
import { client , v2 } from '@datadog/datadog-api-client';
import { getSsmParameter } from './ssmCache';

import { publishSns } from "./snsClient";

// import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// declare var fetch: typeof import('undici').fetch;

// const ssmClient = new SSMClient({ region: 'us-east-1' });

// export const getSsmParameter = async (Name: string) => {
//   const command = new GetParameterCommand({ Name, WithDecryption: true });
//   const response = await ssmClient.send(command);
//   return response.Parameter?.Value;
// };

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

export const handler = async (event: ALBEvent): Promise<ALBResult> => {

  if (event.httpMethod === 'POST') {
    if (!event.body) {
      return handleError('Event body is null or undefined');
    }

    try {
      let body = JSON.parse(event.body);
      const attributesToRemove = ["customers", "memory", "preEngagementData"];
      const nestedAttributesToKeep = { "customers": ["external_id"] }
      // List of attributes to redact
      const sensitiveAttributes = [
        'customerAddress',
        'customerName',
        'from',
        'name',
        'firstName',
        'friendyName',
        'ip',
        'caller',
      ];
      body = removeAttributes(body, attributesToRemove, nestedAttributesToKeep);
      body = redactSensitiveAttributes(body, sensitiveAttributes);
      // Access the account_sid value
      const accountSid = body[0]?.data?.account_sid || body[0]?.data?.accountSid;
      if (!accountSid) {
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
      if (validRequest) {
        const datadogApiKey = await getSsmParameter('/infrastructure-config/twilio-event-streams/datadog/api_key');
        const datadogAppKey = await getSsmParameter('/infrastructure-config/twilio-event-streams/datadog/app_key');
        const datadogSite = 'datadoghq.com';
        const configurationOpts = {
          authMethods: {
            apiKeyAuth: datadogApiKey,
            appKeyAuth: datadogAppKey
          },
        };
        const configuration = client.createConfiguration(configurationOpts);
        configuration.setServerVariables({
          site: datadogSite
        });
        const apiInstance = new v2.LogsApi(configuration);
        const params = {
          body: [
            {
              ddsource: "twilio",
              ddtags: "",
              hostname: "",
              message: JSON.stringify(body[0]),
              service: "twilio-event-stream",
            },
          ],
        };
        try {
          await apiInstance.submitLog(params);
        } catch (error) {
          console.error("Error posting to Datadog", error);
        }

        if (process.env.TWILIO_EVENTS_TOPIC_ARN) {
          try {
            await publishSns({
              topicArn: process.env.TWILIO_EVENTS_TOPIC_ARN,
              message: event.body
            });
          } catch (error) {
            console.error("Error posting to SNS topic", error);
          }
        } else {
          console.warn("TWILIO_EVENTS_TOPIC_ARN not set, cannot publish to SNS");
        }

        return {
          statusCode: 200,
          headers,
          body: '',
        };
      } else {
        return handleError('Invalid Request', new Error('Signature verification failed'), 403);
      }

    }
    catch (error) {
      return handleError('Error handling the POST request', error as Error);
    }
  } else if (event.httpMethod === 'OPTIONS') {
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