import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommandInput,
  PutParameterCommand,
} from '@aws-sdk/client-ssm';
import type { ALBEvent, ALBResult } from 'aws-lambda';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const getRandomChar = () =>
  characters.charAt(Math.floor(Math.random() * characters.length));
const generateRandomString = () => new Array(8).fill(null).map(getRandomChar).join('');

// TODO: factor out (used in other Lambdas)
const buildBadRequest = ({ message, error }: { message: string; error?: any }) => ({
  statusCode: 400,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, error }),
});

const ssmClient = new SSMClient({ region: 'us-east-1' });

export const getSsmParameter = async (Name: string) => {
  const command = new GetParameterCommand({ Name, WithDecryption: true });
  const response = await ssmClient.send(command);
  return response.Parameter?.Value;
};
export const putSsmParameter = async (request: PutParameterCommandInput) => {
  const command = new PutParameterCommand(request);
  return ssmClient.send(command);
};

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  if (event.httpMethod === 'GET') {
    try {
      // Get params from SSM
      const FACEBOOK_APP_ID = await getSsmParameter('FACEBOOK_APP_ID');
      const LAMBDAS_BASE_URL = await getSsmParameter('LAMBDAS_BASE_URL');

      if (!FACEBOOK_APP_ID) throw new Error('FACEBOOK_APP_ID missing.');
      if (!LAMBDAS_BASE_URL) throw new Error('LAMBDAS_BASE_URL missing.');

      if (!event.queryStringParameters || !event.queryStringParameters.facebookPageID)
        return buildBadRequest({
          message: 'queryStringParameters facebookPageID missing in the request payload.',
        });

      const { facebookPageID } = event.queryStringParameters;

      const [key, value] = [generateRandomString(), generateRandomString()];
      const HOUR_IN_MS = 1000 * 60 * 60;
      await putSsmParameter({
        // keep in sync with terraform/environments/templates/microservice-policies/facebookSignin.tftpl
        Name: `/use-1/instagram/temporary-signinToken/${key}`,
        Value: value,
        Type: 'SecureString',
        Tier: 'Advanced',
        Overwrite: true,
        Policies: JSON.stringify([
          {
            Type: 'Expiration',
            Version: '1.0',
            Attributes: {
              Timestamp: new Date(Date.now() + HOUR_IN_MS).toISOString(),
            },
          },
        ]),
      });

      const redirectTo =
        'https://www.facebook.com/v19.0/dialog/oauth?' +
        'response_type=code%20granted_scopes' +
        `&client_id=${FACEBOOK_APP_ID}` +
        `&redirect_uri=${LAMBDAS_BASE_URL}/lambda/facebookCallback` +
        '&scope=business_management,public_profile,email,instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging' +
        `&state=${JSON.stringify({ key, value, facebookPageID })}`;

      // Redirect the user to Facebook auth
      const response = {
        statusCode: 302,
        headers: {
          Location: redirectTo,
        },
      };

      return response;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return { statusCode: 500 };
    }
  }

  // Send HTTP 405: Method Not Allowed
  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Error: Method Not Allowed' }),
  };
};
