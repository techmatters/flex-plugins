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

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { ALBResult } from 'aws-lambda';
import { Readable } from 'stream';

type SavePendingContactsInfo = {
  serverless_url: string;
  api_key: string;
};

const serverlessUrlRegex = /^https:\/\/serverless-\d+-\w+\.twil\.io$/;

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

export const handler = async (): Promise<ALBResult> => {
  try {
    const obj = await getS3Object(
      'save-pending-contacts',
      'save-pending-contacts-list.json',
    );

    if (!obj) throw new Error('Body property missing on save-pending-contacts object');

    const savePendingContactsList = JSON.parse(obj.toString());

    const savePendingContactsCalls = savePendingContactsList.map(
      async (info: SavePendingContactsInfo) => {
        const { serverless_url: serverlessUrl, api_key: apiKeyName } = info;

        if (!serverlessUrlRegex.test(serverlessUrl)) {
          console.error('serverlessUrl does not match regex');
          return Promise.resolve({});
        }

        const url = `${serverlessUrl}/savePendingContacts`;

        const ApiKey = await getSsmParameter(apiKeyName);

        if (!ApiKey) {
          console.warn('ApiKey does not exist');
          return Promise.resolve({});
        }

        return fetch(url, {
          method: 'POST',
          body: JSON.stringify({ ApiKey }),
          headers: { 'Content-Type': 'application/json' },
        });
      },
    );

    await Promise.all(savePendingContactsCalls);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Triggered savePendingContacts' }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500 };
  }
};
