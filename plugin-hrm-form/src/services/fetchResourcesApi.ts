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

import * as path from 'path';

import { getReferrableResourceConfig } from '../hrmConfig';
import { ApiError, fetchApi } from './fetchApi';
import { getValidToken } from '../authentication';

/**
 * Factored out function that handles api calls hosted in the resources service.
 * Will throw Error if server responses with http error code.
 * @param endPoint resources endpoint to fetch from (without the host part of url, e.g. "/resource/MY_RESOURCE_ID").
 * @param {Partial<RequestInit>} options Same options object that will be passed to the fetch function (here you can include the BODY of the request)
 * @returns {Promise<any>} the api response (if not error)
 */
const fetchResourcesApi = (endPoint: string, options: Partial<RequestInit> = {}): Promise<any> => {
  const { resourcesBaseUrl } = getReferrableResourceConfig();
  const token = getValidToken();
  if (token instanceof Error) throw new ApiError(`Aborting request due to token issue: ${token.message}`, {}, token);

  return fetchApi(new URL(resourcesBaseUrl), path.join('resources', endPoint), {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export default fetchResourcesApi;
