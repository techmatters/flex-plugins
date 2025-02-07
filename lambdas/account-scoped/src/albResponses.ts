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

import { ErrorResult } from './Result';
import { HttpError } from './httpTypes';
import { ALBEvent, ALBResult } from 'aws-lambda';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE,PATCH,HEAD',
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
};

export const okJsonResponse = (body: any = {}): ALBResult => ({
  headers: {
    ...CORS_HEADERS,
    'Content-Type': 'application/json',
  },
  statusCode: 200,
  body: JSON.stringify(body),
});

export const notFoundResponse = (event: ALBEvent): ALBResult => ({
  statusCode: 404,
  headers: {
    ...CORS_HEADERS,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: `Route not found ${event.httpMethod} - ${event.path}`,
  }),
});

export const convertHttpErrorResultToALBResult = (
  result: ErrorResult<HttpError>,
): ALBResult => ({
  headers: {
    ...CORS_HEADERS,
    'Content-Type': 'application/json',
  },
  statusCode: result.error.statusCode,
  body: JSON.stringify({
    message: result.message,
    cause: {
      message: result.error.cause?.message,
      stack: result.error.cause?.stack,
    },
  }),
});
