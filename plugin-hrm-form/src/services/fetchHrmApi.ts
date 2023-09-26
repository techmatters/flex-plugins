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

import { fetchApi } from './fetchApi';
import { getHrmConfig } from '../hrmConfig';
import { GenerateSignedUrlPathParams } from '../types/types';

/**
 * Factored out function that handles api calls hosted in HRM backend.
 * Will throw Error if server responses with http error code.
 * @param endPoint endpoint to fetch from (withouth the host part of url, e.g. "/cases/contacts").
 * @param {Partial<RequestInit>} options Same options object that will be passed to the fetch function (here you can include the BODY of the request)
 * @returns {Promise<any>} the api response (if not error)
 */
export const fetchHrmApi = (endPoint: string, options: Partial<RequestInit> = {}): Promise<any> => {
  const { hrmBaseUrl, token } = getHrmConfig();

  return fetchApi(new URL(hrmBaseUrl), endPoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
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
