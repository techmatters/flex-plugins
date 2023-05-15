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

export class ApiError extends Error {
  constructor(message: string, options: { response?: Response; body?: any }, cause?: Error) {
    super(message, { cause });

    // see: https://github.com/microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, ApiError.prototype);

    this.name = 'ApiError';
    this.response = options.response;
    this.body = options.body;
  }

  response: Response;

  body: any;
}

/**
 * Low level fetch wrapper to provide some sensible defaults & rudimentary error handling
 * You would normally wrap this rather than calling it directly, see fetchProtectedApi & fetchHrmApi
 * @param baseUrl
 * @param endpointPath
 * @param token
 * @param options
 */
export const fetchApi = async (baseUrl: URL, endpointPath: string, options: RequestInit): Promise<any> => {
  const url = new URL(path.join(baseUrl.pathname, endpointPath), baseUrl);

  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  let response: Response;
  try {
    response = await fetch(url.toString(), finalOptions);
  } catch (err) {
    throw new ApiError(err.message, {}, err);
  }

  if (!response.ok) {
    let body;
    try {
      body = await response.json();
    } catch (err) {
      body = await response.text();
    }
    throw new ApiError(`Error response: ${response.status} (${response.statusText})`, { response, body });
  }

  if ((response.headers?.get('Content-Type') ?? '').toLowerCase().includes('json')) {
    return response.json();
  }
  return response.text();
};
