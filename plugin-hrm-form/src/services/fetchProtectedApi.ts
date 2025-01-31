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

import { ApiError, fetchApi } from './fetchApi';
import { getHrmConfig } from '../hrmConfig';
import { getValidToken } from '../authentication';

export class ProtectedApiError extends ApiError {
  constructor(message: string, options: Pick<ApiError, 'body' | 'response'>, cause?: Error) {
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
 * @returns {Promise<any>} the api response (if not error)
 */
const fetchProtectedApi = async (endPoint, body: Record<string, string> = {}) => {
  const { serverlessBaseUrl } = getHrmConfig();
  const token = getValidToken();
  if (token instanceof Error) throw new ApiError(`Aborting request due to token issue: ${token.message}`, {}, token);
  const options: RequestInit = {
    method: 'POST',
    body: new URLSearchParams({ ...body, Token: token }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  };
  try {
    return await fetchApi(new URL(serverlessBaseUrl), endPoint, options);
  } catch (error) {
    if (error instanceof ApiError) {
      const {
        response: { status, statusText },
        body,
      } = error;

      const message = body?.message || `Error response: ${status} (${statusText})`;
      const protectedError = new ProtectedApiError(message, { response: error.response, body: error.body }, error);
      if (status === 404 && options.method === 'GET') {
        console.warn(`Resource not found at ${endPoint}:`, protectedError);
        return null;
      }
      throw protectedError;
    } else throw error;
  }
};

export default fetchProtectedApi;
