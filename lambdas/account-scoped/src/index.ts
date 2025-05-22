/**
 * Copyright (C) 2021-2023 Technology Matters
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

import qs from 'querystring';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { lookupRoute } from './router';
import { isErr } from './Result';
import {
  convertHttpErrorResultToALBResult,
  notFoundResponse,
  okJsonResponse,
} from './albResponses';

const parseBody = ({
  body,
  contentTypeHeader,
  isBase64Encoded,
}: {
  contentTypeHeader: string | null;
  body: string | null;
  isBase64Encoded: boolean;
}) => {
  if (!body || !contentTypeHeader) {
    return body;
  }

  if (contentTypeHeader.includes('application/x-www-form-urlencoded')) {
    if (isBase64Encoded) {
      const data = Buffer.from(body, 'base64').toString();
      return qs.parse(data);
    }

    return qs.parse(body);
  }

  if (contentTypeHeader === 'application/json') {
    return JSON.parse(body || 'null');
  }
};

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  console.info('twilio/account-scoped: Triggered by path:', event.path);
  console.debug('twilio/account-scoped event:', JSON.stringify(event));
  const request = {
    method: event.httpMethod,
    path: event.path,
    query: event.queryStringParameters ?? {},
    body: parseBody({
      body: event.body,
      contentTypeHeader: event.headers?.['content-type'] || null,
      isBase64Encoded: event.isBase64Encoded,
    }),
    headers: event.headers ?? {},
  };
  if (request.method === 'OPTIONS') {
    return okJsonResponse();
  }
  const route = lookupRoute(request);
  if (route) {
    let processedRequest = request;
    for (const step of route.requestPipeline) {
      const stepResult = await step(processedRequest, route);
      if (isErr(stepResult)) {
        return convertHttpErrorResultToALBResult(stepResult);
      }
      processedRequest = stepResult.unwrap();
    }
    const result = await route.handler(processedRequest, route.accountSid);
    if (isErr(result)) {
      console.error(
        `handler for path ${event.path} resulted in error ${result.message}`,
        result.error,
      );
      return convertHttpErrorResultToALBResult(result);
    }
    return okJsonResponse(result.unwrap());
  }
  return notFoundResponse(event);
};
