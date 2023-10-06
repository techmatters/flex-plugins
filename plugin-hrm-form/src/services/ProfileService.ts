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

//DELETE THIS
const fetchLocalHrmApi = (endPoint: string, options: Partial<RequestInit> = {}): Promise<any> => {
  const { token } = getHrmConfig();

  return fetchApi(new URL('http://localhost:8080/v0/accounts/ACd8a2e89748318adf6ddff7df6948deaf'), endPoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export const getProfileByIdentifier = async (identifier: string) => {
  let responseJson = 'null';
  try {
    // responseJson = await fetchHrmApi(`/profiles/identifier/${identifier}`);
    responseJson = await fetchLocalHrmApi(`/profiles/identifier/${identifier}`);
  } catch (error) {
    console.log('>>> error', error);
  }

  return responseJson;
};
