import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import type { ALBEvent, ALBResult } from 'aws-lambda';

declare var fetch: typeof import('undici').fetch;

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*', // Allow from anywhere
  'Access-Control-Allow-Methods': 'POST',
};

const s3Client = new S3Client({});

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

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  try {
    if (!event.queryStringParameters)
      throw new Error('No queryStringParameters present in the event.');

    if (event.body && event.headers) {
      const parsedBody = JSON.parse(event.body);

      const { destination: activeUser, events } = parsedBody;

      const isWebhookVerification = events && events.length === 0;
      if (isWebhookVerification) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          body: JSON.stringify({ message: 'OK' }),
        };
      }
      const obj = await getS3Object('aselo-webhooks', 'line-webhook-map.json');

      if (!obj) throw new Error('Body property missing on aselo-webhooks object');

      const webhookMap = JSON.parse(obj.toString());

      // Fail if activeUser is not mapped on line-webhook-map
      if (!webhookMap[activeUser]) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          body: JSON.stringify({
            message:
              'No webhook URL value provided to line-webhook-map for the target user',
          }),
        };
      }

      await fetch(webhookMap[activeUser], {
        method: 'post',
        body: event.body,
        headers: {
          'Content-Type': 'application/json',
          'x-line-signature': event.headers['x-line-signature'] || '',
        },
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        body: JSON.stringify({ message: 'Message redirected.' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify({ message: 'Ignored event.' }),
    };
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
