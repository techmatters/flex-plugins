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

// eslint-disable-next-line import/no-unused-modules
import { ApiError, fetchApi, FetchOptions } from './fetchApi';
import { getHrmConfig } from '../hrmConfig';
import { getValidToken } from '../authentication';
import fetchProtectedApi, { ProtectedApiError } from './fetchProtectedApi';

// eslint-disable-next-line import/no-unused-modules
export const postToAccountScopedLambda = async (
  endpoint: string,
  body: Record<string, any> = {},
  allOptions?: FetchOptions & { useJsonEncode?: boolean },
) => fetchProtectedApi(endpoint, body, { ...(allOptions ?? {}), useTwilioLambda: true });
export const getFromAccountScopedLambda = async (endpoint: string, fetchOptions?: FetchOptions) => {
  const { accountScopedLambdaBaseUrl } = getHrmConfig();
  const token = getValidToken();
  if (token instanceof Error) throw new ApiError(`Aborting request due to token issue: ${token.message}`, {}, token);

  const options: RequestInit = {
    method: 'GET',
    ...(fetchOptions ?? {}),
    headers: {
      Authorization: `Bearer ${token}`,
      ...fetchOptions.headers,
    },
  };
  try {
    return await fetchApi(new URL(accountScopedLambdaBaseUrl), endpoint, options);
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.response?.status === 403 ? 'Server responded with 403 status (Forbidden)' : error.message;
      throw new ProtectedApiError(message, { response: error.response, body: error.body }, error);
    } else throw error;
  }
};
