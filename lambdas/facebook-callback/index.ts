import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
  PutParameterCommandInput,
} from '@aws-sdk/client-ssm';
import type { ALBEvent, ALBResult } from 'aws-lambda';

// TODO: factor out (used in other Lambdas)
const buildBadRequest = ({ message, error }: { message: string; error?: any }) => ({
  statusCode: 400,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, error }),
});

// TODO: factor out (used in other Lambdas)
const illegalCharactersToDashes = (s: string) => s.replace(/[^a-zA-Z0-9_.-]/g, '-');

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
      const FACEBOOK_APP_SECRET = await getSsmParameter('FACEBOOK_APP_SECRET');
      const LAMBDAS_BASE_URL = await getSsmParameter('LAMBDAS_BASE_URL');

      if (!FACEBOOK_APP_ID) throw new Error('FACEBOOK_APP_ID missing.');
      if (!FACEBOOK_APP_SECRET) throw new Error('FACEBOOK_APP_SECRET missing.');
      if (!LAMBDAS_BASE_URL) throw new Error('LAMBDAS_BASE_URL missing.');

      if (
        !event.queryStringParameters ||
        !event.queryStringParameters.code ||
        !event.queryStringParameters.state ||
        !event.queryStringParameters.granted_scopes
      )
        return buildBadRequest({
          message:
            'queryStringParameters not present or some of them are missing in the request payload.',
        });

      const { key, value, facebookPageID } = JSON.parse(
        decodeURIComponent(event.queryStringParameters.state),
      );
      // Get the request token secret from where we stored it in cache (/facebookSignin)
      // keep in sync with terraform/environments/templates/microservice-policies/facebookCallback.tftpl
      const requestTokenSecret = await getSsmParameter(
        `/use-1/instagram/temporary-signinToken/${key}`,
      );

      // Validate that the payload is comming from Facebook in response as a redirect request performed by us in /facebookSignin
      if (requestTokenSecret !== value)
        return {
          statusCode: 403,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Error: not authorized.' }),
        };

      const expectedScopes = [
        'business_management',
        'email',
        // 'public_profile',
        'instagram_basic',
        'instagram_manage_messages',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_metadata',
        'pages_messaging',
      ];

      const grantedScopes = decodeURIComponent(
        event.queryStringParameters.granted_scopes,
      ).split(',');

      const missingScopes = expectedScopes.reduce<string[]>(
        (accum, scope) => (grantedScopes.includes(scope) ? accum : [...accum, scope]),
        [],
      );

      if (missingScopes.length > 0)
        return buildBadRequest({
          message:
            'To integrate Instagram with Aselo, please ensure you are logged in with an account that has access to your Instagram business account and the associated Facebook page.',
          error: `Error: missing expected scopes. missingScopes: ${missingScopes.join(',')}`,
        });

      // Generate short lived auth token
      const code2sltEndpoint =
        'https://graph.facebook.com/v19.0/oauth/access_token?' +
        `&redirect_uri=${LAMBDAS_BASE_URL}/lambda/facebookCallback` +
        `&client_id=${FACEBOOK_APP_ID}` +
        `&client_secret=${FACEBOOK_APP_SECRET}` +
        `&code=${event.queryStringParameters.code}`;

      const sltResponse = await fetch(code2sltEndpoint);

      const sltResult: any = await sltResponse.json();

      if (sltResult.error)
        return buildBadRequest({
          message: "Couldn't generate short lived auth token",
          error: sltResult.error,
        });

      const { access_token: shortLivedToken } = sltResult;

      // Generate long lived auth token
      const slt2lltEndpoint =
        'https://graph.facebook.com/v19.0/oauth/access_token?' +
        '&grant_type=fb_exchange_token' +
        `&client_id=${FACEBOOK_APP_ID}` +
        `&client_secret=${FACEBOOK_APP_SECRET}` +
        `&fb_exchange_token=${shortLivedToken}`;

      const lltResponse = await fetch(slt2lltEndpoint);

      const lltResult: any = await lltResponse.json();

      if (lltResult.error)
        return buildBadRequest({
          message: "Couldn't generate long lived auth token",
          error: lltResult.error,
        });

      const { access_token: longLivedToken } = lltResult;

      // Validate that the user can actually manage the target page
      const pagesInfoEndpoint = `https://graph.facebook.com/v19.0/me/accounts?access_token=${shortLivedToken}`;
      const pagesInfoResponse = await fetch(pagesInfoEndpoint);
      const pagesInfoResult: any = await pagesInfoResponse.json();

      if (pagesInfoResult.error)
        return buildBadRequest({
          message: "Couldn't retrieve list of managed pages",
          error: pagesInfoResult.error,
        });

      const targetPageInfo =
        pagesInfoResult.data &&
        pagesInfoResult.data.find((p: { id: string }) => p.id === facebookPageID);

      if (!targetPageInfo)
        return buildBadRequest({
          message: `Looks like you don't have manage permissions on the target Facebook page with id ${facebookPageID}`,
        });

      const { name: facebookPageName } = targetPageInfo;

      // Get long lived Page Access Token (PAT)
      const llt2patEndpoint = `https://graph.facebook.com/${facebookPageID}?fields=access_token,name,instagram_business_account&access_token=${longLivedToken}`;

      const patResponse = await fetch(llt2patEndpoint);
      const patResult: any = await patResponse.json();

      if (patResult.error)
        return buildBadRequest({
          message: "Couldn't generate long lived Page Access Token",
          error: patResult.error,
        });

      const pageAccessToken = patResult.access_token;
      const instagramID = patResult.instagram_business_account.id;

      // Save the credentials in SSM
      await putSsmParameter({
        Name: illegalCharactersToDashes(
          `FACEBOOK_PAGE_ACCESS_TOKEN_${facebookPageID}_${facebookPageName}`,
        ),
        Value: pageAccessToken,
        Type: 'SecureString',
        Overwrite: true,
      });
      await putSsmParameter({
        Name: illegalCharactersToDashes(
          `INSTAGRAM_CONNECTED_ID_${facebookPageID}_${facebookPageName}`,
        ),
        Value: instagramID,
        Type: 'SecureString',
        Overwrite: true,
      });

      const response = {
        statusCode: 200,
        statusDescription: '200 OK',
        headers: { 'Content-Type': 'text/html' },
        body: '<h1>Ok!</h1>',
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
