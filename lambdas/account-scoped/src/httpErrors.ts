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
import { ErrorResult, newErr } from './Result';
import { HttpError } from './httpTypes';

export class HttpClientError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    Object.setPrototypeOf(this, HttpClientError.prototype);
    this.statusCode = statusCode;
    this.name = 'HttpClientError';
  }
}

export const newMissingParameterResult = (property: string): ErrorResult<HttpError> =>
  newErr({
    message: `${property} missing`,
    error: { cause: new Error(`${property} is required`), statusCode: 400 },
  });

export const newMissingEnvironmentVariableResult = (
  envVar: string,
): ErrorResult<HttpError> =>
  newErr({
    message: `Environment variable ${envVar} missing`,
    error: {
      cause: new Error(`Environment variable ${envVar} is required`),
      statusCode: 500,
    },
  });

export const newHttpErrorResult = (
  cause: Error | string,
  statusCode: number,
  message?: string,
): ErrorResult<HttpError> =>
  newErr({
    message: message ?? (typeof cause === 'string' ? cause : cause.message),
    error: { ...(typeof cause !== 'string' ? { cause } : {}), statusCode },
  });
