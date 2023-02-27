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

import each from 'jest-each';

import { ApiError, fetchApi } from '../../services/fetchApi';

global.fetch = jest.fn();

const BASE_URL = new URL('https://all.your/base');

describe('fetchProtectedApi', () => {
  const mockFetch = fetch as jest.Mock<Promise<Partial<Response>>>;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('OK response', () => {
    const responseBody = { a: 'property' };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        json(): Promise<any> {
          return Promise.resolve(responseBody);
        },
        text(): Promise<any> {
          return Promise.resolve(responseBody);
        },
        ok: true,
        status: 200,
        statusText: 'OK',
      });
    });
    test('Default options - Makes a GET request to the provided endpoint, returning the serialised body', async () => {
      const response = await fetchApi(BASE_URL, '/areBelongToUs', {});
      expect(response).toStrictEqual(responseBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your/base/areBelongToUs',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
    });
    test('Extra options - adds options to defaults', async () => {
      const response = await fetchApi(BASE_URL, '/areBelongToUs', {
        redirect: 'follow',
      });
      expect(response).toStrictEqual(responseBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your/base/areBelongToUs',
        expect.objectContaining({
          method: 'GET',
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
    });
    test('Override options - overwrites options but keeps the rest', async () => {
      const response = await fetchApi(BASE_URL, '/areBelongToUs', {
        method: 'POST',
        body: 'a request body',
      });
      expect(response).toStrictEqual(responseBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your/base/areBelongToUs',
        expect.objectContaining({
          method: 'POST',
          body: 'a request body',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
    });
    test('Extra headers - adds headers to defaults', async () => {
      const response = await fetchApi(BASE_URL, '/areBelongToUs', {
        headers: {
          Authorization: 'Bearer ofBadNews',
        },
      });
      expect(response).toStrictEqual(responseBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your/base/areBelongToUs',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ofBadNews',
          },
        }),
      );
    });
    test('Override headers - replaces defaults', async () => {
      const response = await fetchApi(BASE_URL, '/areBelongToUs', {
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain',
          Authorization: 'Bearer ofBadNews',
        },
      });
      expect(response).toStrictEqual(responseBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your/base/areBelongToUs',
        expect.objectContaining({
          method: 'GET',
          redirect: 'follow',
          headers: {
            'Content-Type': 'text/plain',
            Authorization: 'Bearer ofBadNews',
          },
        }),
      );
    });
    each([
      { baseUrl: 'https://all.your.base', endpoint: '/areBelongToUs', expected: 'https://all.your.base/areBelongToUs' },
      { baseUrl: 'https://all.your.base', endpoint: 'areBelongToUs', expected: 'https://all.your.base/areBelongToUs' },
      { baseUrl: 'https://all.your.base/', endpoint: 'areBelongToUs', expected: 'https://all.your.base/areBelongToUs' },
      {
        baseUrl: 'https://all.your.base/',
        endpoint: '/areBelongToUs',
        expected: 'https://all.your.base/areBelongToUs',
      },
      {
        baseUrl: 'https://all.your.base/',
        endpoint: 'areBelongToUs/',
        expected: 'https://all.your.base/areBelongToUs/',
      },
      {
        baseUrl: 'https://all.your.base/',
        endpoint: '/areBelongToUs/',
        expected: 'https://all.your.base/areBelongToUs/',
      },
      { baseUrl: 'https://all.your/base', endpoint: 'areBelongToUs', expected: 'https://all.your/base/areBelongToUs' },
      { baseUrl: 'https://all.your/base/', endpoint: 'areBelongToUs', expected: 'https://all.your/base/areBelongToUs' },
      {
        baseUrl: 'https://all.your/base/',
        endpoint: '/areBelongToUs',
        expected: 'https://all.your/base/areBelongToUs',
      },
      {
        baseUrl: 'https://all.your/base/',
        endpoint: 'areBelongToUs/',
        expected: 'https://all.your/base/areBelongToUs/',
      },
      {
        baseUrl: 'https://all.your/base/',
        endpoint: '/areBelongToUs/',
        expected: 'https://all.your/base/areBelongToUs/',
      },
    ]).test(
      "When base URL is '$baseUrl' and endpoint is '$endpoint', the URL called should be '$expected'",
      async ({ baseUrl, endpoint, expected }) => {
        await fetchApi(new URL(baseUrl), endpoint, {});
        expect(fetch).toHaveBeenCalledWith(
          expected,
          expect.objectContaining({
            method: 'GET',
          }),
        );
      },
    );
  });
  test('JSON error response - throws ApiError with body set to deserialized json', async () => {
    const response = { error: 'message' };
    const mockResponse = {
      json(): Promise<any> {
        return Promise.resolve(response);
      },
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    };
    mockFetch.mockResolvedValue(mockResponse);
    await expect(fetchApi(BASE_URL, '/areBelongToUs', {})).rejects.toThrow(
      new ApiError('Error response: 403 (Forbidden)', {
        body: { error: 'message' },
        response: mockResponse as Response,
      }),
    );
  });
  test('Error response not parsable JSON - throws ApiError with body set to deserialized json', async () => {
    const response = 'Not JSON';
    const mockResponse = {
      json(): Promise<any> {
        return Promise.reject(new Error('Nope'));
      },
      text(): Promise<any> {
        return Promise.resolve(response);
      },
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    };
    mockFetch.mockResolvedValue(mockResponse);
    await expect(fetchApi(BASE_URL, '/areBelongToUs', {})).rejects.toThrow(
      new ApiError('Error response: 500 (Internal Server Error)', {
        body: 'Not JSON',
        response: mockResponse as Response,
      }),
    );
  });
});
