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

import { ALBEvent, ALBResult } from 'aws-lambda';
import { HttpError, lookupRoute } from './router';
import { ErrorResult, isErr } from './Result';

const convertHttpErrorResultToALBResult = (
  result: ErrorResult<HttpError>,
): ALBResult => ({
  statusCode: result.error.statusCode,
  body: JSON.stringify({
    message: result.message,
    cause: {
      message: result.error.cause?.message,
      stack: result.error.cause?.stack,
    },
  }),
});

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  console.debug('twilio/account-scoped: Triggered by event:', JSON.stringify(event));
  const request = {
    method: event.httpMethod,
    path: event.path,
    body: JSON.parse(event.body || 'null'),
  };
  const route = lookupRoute(request);
  if (route) {
    let processedRequest = request;
    for (const step of route.requestPipeline) {
      const stepResult = await step(processedRequest);
      if (isErr(stepResult)) {
        return convertHttpErrorResultToALBResult(stepResult);
      }
      processedRequest = stepResult.unwrap();
    }
    const result = await route.handler(processedRequest);
    if (isErr(result)) {
      return convertHttpErrorResultToALBResult(result);
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result.unwrap()),
    };
  }
  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Route not found ${event.httpMethod} - ${event.path}`,
    }),
  };
};
