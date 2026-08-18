/**
 * Copyright (C) 2021-2026 Technology Matters
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
 * TODO: Once serverless is fully deprecated, move all account scoped lambda calls to go via fetchAccountScopedLambdaApi.ts methods
 * TODO: Then refactor this to be a generic base method that fetchHrmApi, fetchResourcesApi and fetchAccountScopedApi all call to add the token to the request
 */
export const fetchProtectedApi = async (
  endpoint: string,
  body: Record<string, any> = {},
  allOptions?: FetchOptions & { useTwilioLambda?: boolean; useJsonEncode?: boolean },
) => {
  const { serverlessBaseUrl, accountScopedLambdaBaseUrl } = getHrmConfig();
  const { useTwilioLambda, useJsonEncode, ...fetchOptions } = allOptions ?? {};
  const token = getValidToken();
  if (token instanceof Error) throw new ApiError(`Aborting request due to token issue: ${token.message}`, {}, token);

  // Adding the token to the body is for backwards compatibility only
  // Once serverless is fully deprecated and all account scoped lambdas are past v2.65.x it can be removed
  // Also, support for form encoded payloads can probably be removed once serverless is deprecated too, since account-scoped lambda supports JSON request bodies on all endpoints
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
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType,
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  };
  try {
    return await fetchApi(new URL(useTwilioLambda ? accountScopedLambdaBaseUrl : serverlessBaseUrl), endpoint, options);
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.response?.status === 403 ? 'Server responded with 403 status (Forbidden)' : error.message;
      throw new ProtectedApiError(message, { response: error.response, body: error.body }, error);
    } else throw error;
  }
};

export default fetchProtectedApi;
