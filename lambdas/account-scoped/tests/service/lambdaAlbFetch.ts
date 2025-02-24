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

import { ALBEvent } from 'aws-lambda';
import { handler } from '../../src';
import { getExpectedTwilioSignature } from 'twilio/lib/webhooks/webhooks';

const TEST_HOST = 'example.com';

/**
 * QOL method that allows tests to invoke the lambda via the Runtime Interface Client in a similar way to how external callers would invoke them via the ALB
 * @param path
 * @param options
 */
export const lambdaAlbFetch = async (
  path: string,
  options: RequestInit & { signatureAuthToken?: string } = {},
): Promise<Response> => {
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  const multiValueHeaders: Record<string, string[]> = {};
  const headers: Record<string, string> = {};
  if (Array.isArray(options.headers)) {
    options.headers.forEach((value, key) => {
      multiValueHeaders[key] = value;
    });
  } else if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        multiValueHeaders[key.toLowerCase()] = value;
      } else {
        headers[key.toLowerCase()] = value;
      }
    });
  }
  headers.host = headers.host || TEST_HOST;
  if (options.signatureAuthToken) {
    headers['x-twilio-signature'] = getExpectedTwilioSignature(
      options.signatureAuthToken,
      headers['x-original-webhook-url'] || `https://${TEST_HOST}${path}`,
      JSON.parse(options.body?.toString() || '{}'),
    );
  }

  const payload: ALBEvent = {
    requestContext: {
      elb: {
        targetGroupArn: 'ignored',
      },
    },
    httpMethod: options.method || 'GET',
    multiValueHeaders,
    headers,
    path: sanitizedPath,
    body: options.body?.toString() || '',
    isBase64Encoded: false,
  };

  const albResponse = await handler(payload);

  console.log(
    `${payload.httpMethod} ${sanitizedPath} response`,
    albResponse.statusCode,
    albResponse.body,
  );
  const responseHeaderEntries = [
    ...Object.entries((albResponse.headers || {}) as Record<string, string>).map(
      ([k, v]) => [k, v.toString()],
    ),
    ...Object.entries(
      (albResponse.multiValueHeaders || {}) as Record<string, string[]>,
    ).map(([k, v]) => [k, v.join(', ')]),
  ];
  return {
    status: albResponse.statusCode,
    statusText: albResponse.statusDescription || '',
    ok: albResponse.statusCode >= 200 && albResponse.statusCode < 300,
    json: async () => JSON.parse(albResponse.body || '{}'),
    text: async () => albResponse.body || '',
    headers: new Headers(responseHeaderEntries),
    redirected: false,
    type: 'basic',
    url: '',
    clone: () => {
      throw new Error('Not implemented');
    },
    bodyUsed: false,
    body: null,
    formData: async () => {
      throw new Error('Not implemented');
    },
    arrayBuffer: async () => {
      throw new Error('Not implemented');
    },
    blob: async () => {
      throw new Error('Not implemented');
    },
  };
};
