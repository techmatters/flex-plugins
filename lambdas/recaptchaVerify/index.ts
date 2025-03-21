import type { ALBEvent, ALBResult } from 'aws-lambda';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

declare var fetch: typeof import('undici').fetch;

const ssmClient = new SSMClient({ region: 'us-east-1' });

export const getSsmParameter = async (Name: string) => {
  const command = new GetParameterCommand({ Name, WithDecryption: true });
  const response = await ssmClient.send(command);
  return response.Parameter?.Value;
};

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
};

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  if (event.httpMethod === 'POST') {
    try {
      const RECAPTCHA_SECRET = await getSsmParameter('/global/google/recaptcha/secret_key');

      const userResponse = event;

      if (!userResponse) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Error: Missing reCAPTCHA token' }),
        };
      }

      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${RECAPTCHA_SECRET}&response=${userResponse}`,
      });

      const recaptchaResult = await recaptchaResponse.json();

      if (recaptchaResult) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'reCAPTCHA verified successfully' }),
        };
      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Error: Invalid reCAPTCHA response' }),
        };
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(err),
      };
    }
  } else if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Send HTTP 405: Method Not Allowed
  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Error: Method Not Allowed' }),
  };
};
