import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { ALBEvent, ALBResult } from 'aws-lambda';
import { Readable } from 'stream';
import * as crypto from 'crypto';

declare var fetch: typeof import('undici').fetch;

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*', // Allow from anywhere
  'Access-Control-Allow-Methods': 'GET,POST',
};

const ignoreEventPayload = {
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  body: JSON.stringify({ message: 'Ignored event.' }),
};

const ssmClient = new SSMClient({ region: 'us-east-1' });
const s3Client = new S3Client({});

export const getSsmParameter = async (Name: string) => {
  const command = new GetParameterCommand({ Name, WithDecryption: true });
  const response = await ssmClient.send(command);
  return response.Parameter?.Value;
};

export const getS3Object = async (Bucket: string, Key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
    ResponseContentType: 'application/json',
  });
  const response = await s3Client.send(command);

  let responseDataChunks: Buffer[] = [];
  const responseBody = response.Body as Readable;

  return new Promise<string>(async (resolve, reject) => {
    try {
      responseBody.once('error', err => reject(err));
      responseBody.on('data', (chunk: Buffer) => responseDataChunks.push(chunk));
      responseBody.once('end', () =>
        resolve(Buffer.concat(responseDataChunks).toString()),
      );
    } catch (err) {
      // Handle the error or throw
      return reject(err);
    }
  });
};

const isValidFacebookPayload = (event: ALBEvent, appSecret: string) => {
  const xHubSignature = event.headers && event.headers['x-hub-signature'];

  if (event.body === null || !xHubSignature) return false;

  const expectedSignature = crypto
    .createHmac('sha1', appSecret)
    .update(event.body)
    .digest('hex');

  const isValidRequest = crypto.timingSafeEqual(
    Buffer.from(xHubSignature),
    Buffer.from(`sha1=${expectedSignature}`),
  );

  return isValidRequest;
};

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  try {
    // Facebook sends a GET on verification request
    if (event.httpMethod === 'GET') {
      if (!event.queryStringParameters)
        throw new Error('No queryStringParameters present in the event.');

      const FACEBOOK_VERIFY_TOKEN = await getSsmParameter('FACEBOOK_VERIFY_TOKEN');

      if (!FACEBOOK_VERIFY_TOKEN) throw new Error('FACEBOOK_VERIFY_TOKEN missing.');

      if (
        event.queryStringParameters['hub.mode'] === 'subscribe' &&
        event.queryStringParameters['hub.verify_token'] === FACEBOOK_VERIFY_TOKEN &&
        event.queryStringParameters['hub.challenge']
      ) {
        return {
          statusCode: 200,
          body: event.queryStringParameters['hub.challenge'],
        };
      }
    }

    // Facebook sends POST methods for the message events
    if (event.httpMethod === 'POST') {
      const FACEBOOK_APP_SECRET = await getSsmParameter('FACEBOOK_APP_SECRET');

      if (!FACEBOOK_APP_SECRET) throw new Error('FACEBOOK_APP_SECRET missing.');

      if (event.body && event.headers) {
        if (!isValidFacebookPayload(event, FACEBOOK_APP_SECRET))
          return {
            statusCode: 403,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            body: JSON.stringify({ message: 'Unauthorized' }),
          };

        const parsedBody = JSON.parse(event.body);

        // If is not instagram object, does not belongs to this webhook
        if (parsedBody.object !== 'instagram')
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            body: JSON.stringify({
              message: `Invocation triggered by ${parsedBody.object} object, this webhook only accepts instagram`,
            }),
          };

        if (parsedBody.entry.length > 1)
          throw new Error(
            'We do not support batch events on this webhook. If this ever happens, we need to consider the case where multiple events are batched in a single webhook invocation.',
          );

        // Get the IGSID that triggered the webhook (the one subscribed to the webhook)
        const { id: activeUser } = parsedBody.entry[0];

        const obj = await getS3Object('aselo-webhooks', 'instagram-webhook-map.json');

        if (!obj) throw new Error('Body property missing on aselo-webhooks object');

        const webhookMap = JSON.parse(obj.toString());

        if (!webhookMap[activeUser])
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            body: JSON.stringify({
              message:
                'No webhook URL value provided to aselo-webhook-map for the target user',
            }),
          };

        await fetch(webhookMap[activeUser], {
          method: 'post',
          body: JSON.stringify({
            ...parsedBody,
            xHubSignature: event.headers['x-hub-signature'],
            bodyAsString: event.body,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          body: JSON.stringify({ message: 'Message redirected.' }),
        };
      }

      return ignoreEventPayload;
    }

    return ignoreEventPayload;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify(err),
    };
  }
};
