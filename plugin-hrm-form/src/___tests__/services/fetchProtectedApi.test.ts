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

import { getHrmConfig } from '../../hrmConfig';
import fetchProtectedApi, { ProtectedApiError } from '../../services/fetchProtectedApi';
import { getValidToken } from '../../authentication';
import { ApiError } from '../../services/fetchApi';

global.fetch = jest.fn();

jest.mock('../../hrmConfig');

jest.mock('../../authentication', () => ({
  getValidToken: jest.fn(),
}));

const mockGetValidToken = getValidToken as jest.MockedFunction<typeof getValidToken>;

describe('fetchProtectedApi', () => {
  const mockFetch = fetch as jest.Mock<Promise<Partial<Response>>>;
  const mockHrmGetConfig = getHrmConfig as jest.Mock<Partial<ReturnType<typeof getHrmConfig>>>;
  const requestBody = { an: 'input', another: '1' };

  beforeEach(() => {
    mockFetch.mockClear();
    mockHrmGetConfig.mockClear();
    mockHrmGetConfig.mockReturnValue({ serverlessBaseUrl: 'https://all.your/base' });
    mockGetValidToken.mockClear();
    mockGetValidToken.mockReturnValue('of my appreciation');
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
    test('OK response - Makes a POST request to the provided endpoint, returning the serialised body', async () => {
      const response = await fetchProtectedApi('/areBelongToUs', requestBody);
      expect(response).toStrictEqual(responseBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your/base/areBelongToUs',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
    test('OK response - Makes a POST request to the provided endpoint, creates URL parameters out of body, appending the token', async () => {
      const response = await fetchProtectedApi('/areBelongToUs', requestBody);
      expect(response).toStrictEqual(responseBody);
      const { body, headers }: { body: URLSearchParams; headers: Record<string, string> } = mockFetch.mock.calls[0][1];
      expect(body.toString()).toBe(new URLSearchParams({ ...requestBody, Token: 'of my appreciation' }).toString());
      expect(headers).toStrictEqual({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' });
    });
  });
  test('403 error response - throws ProtectedApiError with specific error message', async () => {
    const requestBody = { error: 'message' };
    const mockResponse = {
      json(): Promise<any> {
        return Promise.resolve(requestBody);
      },
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    };
    mockFetch.mockResolvedValue(mockResponse);
    await expect(fetchProtectedApi('/areBelongToUs', requestBody)).rejects.toThrow(
      new ProtectedApiError('Server responded with 403 status (Forbidden)', {
        body: { error: 'message' },
        response: mockResponse as Response,
      }),
    );
  });
  test('Invalid token - aborts request and throws ApiError', async () => {
    const tokenError = new Error('not appreciated');
    mockGetValidToken.mockReturnValue(tokenError);
    try {
      await fetchProtectedApi('/areBelongToUs', { some: 'stuff' });
      expect(false).toBe(true); // should not reach this point
    } catch (error) {
      expect(error).toEqual(new ApiError('Aborting request due to token issue: not appreciated', {}, tokenError));
    }
    expect(mockFetch).not.toHaveBeenCalled();
  });
  each([
    { status: 500, statusText: 'Internal Error' },
    { status: 502, statusText: 'Bad Gateway' },
    { status: 504, statusText: 'Gateway Timeout' },
    { status: 400, statusText: 'Bad Request' },
    { status: 401, statusText: 'Unauthorized' },
    { status: 404, statusText: 'Not Found' },
  ]).test('other error response - throws ProtectedApiError with generic message', async ({ status, statusText }) => {
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
    await expect(fetchProtectedApi('/areBelongToUs', requestBody)).rejects.toThrow(
      new ProtectedApiError(`Error response: ${status} (${statusText})`, {
        body: { error: 'message' },
        response: mockResponse as Response,
      }),
    );
  });
});
describe('ProtectedApiError', () => {
  test('provided response with stack property on the body JSON - copies the stack property value to the Errors serverStack property', () => {
    const body = { error: 'message', stack: ['some', 'frames'] };
    const error = new ProtectedApiError('Server responded with 403 status (Forbidden)', {
      body,
      response: {
        json(): Promise<any> {
          return Promise.resolve(body);
        },
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response,
    });
    expect(error.serverStack).toStrictEqual(['some', 'frames']);
  });
  test('provided response without stack property on the body JSON - serverStack property is undefined', () => {
    const body = { error: 'message' };
    const error = new ProtectedApiError('Server responded with 403 status (Forbidden)', {
      body,
      response: {
        json(): Promise<any> {
          return Promise.resolve(body);
        },
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response,
    });
    expect(error.serverStack).not.toBeDefined();
  });
});
