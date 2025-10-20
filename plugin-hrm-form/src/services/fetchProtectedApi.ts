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

import { ApiError, fetchApi, FetchOptions } from './fetchApi';
import { getHrmConfig } from '../hrmConfig';
import { getValidToken } from '../authentication';

export class ProtectedApiError extends ApiError {
  constructor(message, options: Pick<ApiError, 'body' | 'response'>, cause?: Error) {
    super(message, options, cause);

    this.name = 'ProtectedApiError';
    this.serverStack = this.body?.stack;

    Object.setPrototypeOf(this, ProtectedApiError.prototype);
  }

  serverStack: any;
}

/**
 * Factored out function that handles a protected api call hosted in serverless toolkit.
 * Will throw Error if server responses with and http error code.
 * @param {string} endPoint endpoint to fetch from (withouth the host part of url, e.g. "/cases/contacts").
 * @param {{ [k: string]: any }} body Same options object that will be passed to the fetch function (here you can include the BODY of the request)
 * @param {FetchOptions & { useTwilioLambda?: boolean }} allOptions
 * @returns {Promise<any>} the api response (if not error)
 */
const fetchProtectedApi = async (
  endPoint,
  body: Record<string, any> = {},
  allOptions?: FetchOptions & { useTwilioLambda?: boolean; useJsonEncode?: boolean },
) => {
  const { serverlessBaseUrl, accountScopedLambdaBaseUrl } = getHrmConfig();
  const { useTwilioLambda, useJsonEncode, ...fetchOptions } = allOptions ?? {};
  const token = getValidToken();
  if (token instanceof Error) throw new ApiError(`Aborting request due to token issue: ${token.message}`, {}, token);

  const { contentType, encodedBody } = useJsonEncode
    ? { contentType: 'application/json', encodedBody: JSON.stringify({ ...body, Token: token }) }
    : {
        contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
        encodedBody: new URLSearchParams({ ...body, Token: token }),
      };

  const options: RequestInit = {
    method: 'POST',
    body: encodedBody,
    headers: {
      'Content-Type': contentType,
    },
    ...fetchOptions,
  };
  try {
    return await fetchApi(new URL(useTwilioLambda ? accountScopedLambdaBaseUrl : serverlessBaseUrl), endPoint, options);
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.response?.status === 403 ? 'Server responded with 403 status (Forbidden)' : error.message;
      throw new ProtectedApiError(message, { response: error.response, body: error.body }, error);
    } else throw error;
  }
};

export default fetchProtectedApi;
