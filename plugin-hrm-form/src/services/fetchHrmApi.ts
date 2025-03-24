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
import { GenerateSignedUrlPathParams } from '../types/types';
import { getValidToken } from '../authentication';

const fetchProtectedApi = (baseUrl: string, endPoint: string, options: Partial<FetchOptions> = {}): Promise<any> => {
  const token = getValidToken();
  if (token instanceof Error) throw new ApiError(`Aborting request due to token issue: ${token.message}`, {}, token);

  return fetchApi(new URL(baseUrl), endPoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};
/**
 * Factored out function that handles api calls hosted in HRM backend.
 * Will throw Error if server responses with http error code.
 * @param endPoint endpoint to fetch from (withouth the host part of url, e.g. "/cases/contacts").
 * @param {Partial<RequestInit>} options Same options object that will be passed to the fetch function (here you can include the BODY of the request)
 * @returns {Promise<any>} the api response (if not error)
 */
export const fetchHrmApi = (endPoint: string, options: Partial<FetchOptions> = {}): Promise<any> => {
  const { hrmBaseUrl } = getHrmConfig();

  return fetchProtectedApi(hrmBaseUrl, endPoint, options);
};

export const fetchBaseApi = (endPoint: string, options: Partial<FetchOptions> = {}): Promise<any> => {
  const { baseUrl } = getHrmConfig();

  return fetchProtectedApi(baseUrl, endPoint, options);
};

export const generateSignedURLPath = ({
  method,
  objectType,
  objectId,
  fileType,
  location: { bucket, key },
}: GenerateSignedUrlPathParams) => {
  return `/files/urls?method=${method}&objectType=${objectType}&objectId=${objectId}&fileType=${fileType}&bucket=${bucket}&key=${key}`;
};
