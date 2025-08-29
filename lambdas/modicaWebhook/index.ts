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

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import type { ALBEvent, ALBResult } from 'aws-lambda';

const s3Client = new S3Client({});

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*', // Allow from anywhere
  'Access-Control-Allow-Methods': 'POST',
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

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  try {
    if (!event.queryStringParameters)
      throw new Error('No queryStringParameters present in the event.');

    if (event.body && event.headers) {
      const parsedBody = JSON.parse(event.body);

      const { destination: activeUser } = parsedBody;

      const obj = await getS3Object('aselo-webhooks', 'modica-webhook-map.json');

      if (!obj) throw new Error('Body property missing on aselo-webhooks object');

      const webhookMap = JSON.parse(obj.toString());

      // Fail if activeUser is not mapped on modica-webhook-map
      if (!webhookMap[activeUser]) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message:
              'No webhook URL value provided to modica-webhook-map for the target user',
          }),
        };
      }

      await fetch(webhookMap[activeUser], {
        method: 'post',
        body: event.body,
        headers: {
          'Content-Type': 'application/json',
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
