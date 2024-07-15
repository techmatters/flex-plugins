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

import { fetchHrmApi } from '../../services/fetchHrmApi';
import { ApiError } from '../../services/fetchApi';
import { getHrmConfig } from '../../hrmConfig';
import { getValidToken } from '../../authentication';

global.fetch = jest.fn();

jest.mock('../../hrmConfig');

jest.mock('../../authentication', () => ({
  getValidToken: jest.fn(() => 'of my appreciation'),
}));

describe('fetchHrmApi', () => {
  const mockFetch = fetch as jest.Mock<Promise<Partial<Response>>>;
  const mockGetHrmConfig = getHrmConfig as jest.Mock<Partial<ReturnType<typeof getHrmConfig>>>;
  const requestBody = { an: 'input', another: '1' };

  beforeEach(() => {
    mockFetch.mockClear();
    mockGetHrmConfig.mockClear();
    mockGetHrmConfig.mockReturnValue({ hrmBaseUrl: 'https://all.your/base' });
    (getValidToken as jest.MockedFunction<typeof getValidToken>).mockReturnValue('of my appreciation');
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
    test('Default request options - Makes a GET request to the provided endpoint with the token from configuration set as the Bearer token, returning the serialised body', async () => {
      const response = await fetchHrmApi('/areBelongToUs');
      expect(response).toStrictEqual(responseBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your/base/areBelongToUs',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer of my appreciation` },
        }),
      );
    });
    test('POST request with body - Makes a POST request to the provided endpoint, creates URL parameters out of body, appending the token', async () => {
      const response = await fetchHrmApi('/areBelongToUs', { method: 'POST', body: JSON.stringify(requestBody) });
      expect(response).toStrictEqual(responseBody);
      const { body, headers }: { body: URLSearchParams; headers: Record<string, string> } = mockFetch.mock.calls[0][1];
      expect(body).toBe(JSON.stringify(requestBody));
      expect(headers).toStrictEqual({ 'Content-Type': 'application/json', Authorization: `Bearer of my appreciation` });
    });
    test('Extra headers specified - retains default headers', async () => {
      const response = await fetchHrmApi('/areBelongToUs', { headers: { Accept: 'text/plain' } });
      expect(response).toStrictEqual(responseBody);
      const { headers }: { body: URLSearchParams; headers: Record<string, string> } = mockFetch.mock.calls[0][1];
      expect(headers).toStrictEqual({
        'Content-Type': 'application/json',
        Authorization: `Bearer of my appreciation`,
        Accept: 'text/plain',
      });
    });
  });
  each([
    { status: 500, statusText: 'Internal Error' },
    { status: 502, statusText: 'Bad Gateway' },
    { status: 504, statusText: 'Gateway Timeout' },
    { status: 400, statusText: 'Bad Request' },
    { status: 401, statusText: 'Unauthorized' },
    { status: 403, statusText: 'Forbidden' },
    { status: 404, statusText: 'Not Found' },
  ]).test('other error response - throws ApiError with generic message', async ({ status, statusText }) => {
    const requestBody = { error: 'message' };
    const mockResponse = {
      json(): Promise<any> {
        return Promise.resolve(requestBody);
      },
      ok: false,
      status,
      statusText,
    };
    mockFetch.mockResolvedValue(mockResponse);
    await expect(fetchHrmApi('/areBelongToUs')).rejects.toThrow(
      new ApiError(`Error response: ${status} (${statusText})`, {
        body: { error: 'message' },
        response: mockResponse as Response,
      }),
    );
  });
  test('Invalid token - aborts request and throws ApiError', async () => {
    const tokenError = new Error('not appreciated');
    (getValidToken as jest.MockedFunction<typeof getValidToken>).mockReturnValue(tokenError);
    expect(() => fetchHrmApi('/areBelongToUs')).toThrow(
      new ApiError('Aborting request due to token issue: not appreciated', {}, tokenError),
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
