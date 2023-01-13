import each from 'jest-each';

import { getConfig } from '../../HrmFormPlugin';
import fetchProtectedApi, { ProtectedApiError } from '../../services/fetchProtectedApi';

global.fetch = jest.fn();

jest.mock('../../HrmFormPlugin');

describe('fetchProtectedApi', () => {
  const mockFetch = fetch as jest.Mock<Promise<Partial<Response>>>;
  const mockGetConfig = getConfig as jest.Mock<Partial<ReturnType<typeof getConfig>>>;
  const requestBody = { an: 'input', another: '1' };

  beforeEach(() => {
    mockFetch.mockClear();
    mockGetConfig.mockClear();
    mockGetConfig.mockReturnValue({ token: 'of my appreciation', serverlessBaseUrl: 'https://all.your/base' });
  });

  describe('OK response', () => {
    const responseBody = { a: 'property' };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        json(): Promise<any> {
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
        mockGetConfig.mockReturnValue({ token: 'of my appreciation', serverlessBaseUrl: baseUrl });
        await fetchProtectedApi(endpoint, requestBody);
        expect(fetch).toHaveBeenCalledWith(
          expected,
          expect.objectContaining({
            method: 'POST',
          }),
        );
      },
    );
    test("Endpoint doesn't have leading slash - concatenates a valid URL", async () => {
      mockGetConfig.mockReturnValue({ token: 'of my appreciation', serverlessBaseUrl: 'https://all.your.base' });
      await fetchProtectedApi('areBelongToUs', requestBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your.base/areBelongToUs',
        expect.objectContaining({
          method: 'POST',
        }),
      );
      mockGetConfig.mockReturnValue({ token: 'of my appreciation', serverlessBaseUrl: 'https://all.your/base' });
      await fetchProtectedApi('areBelongToUs', requestBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your.base/areBelongToUs',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
    test('Base URL has trailing slash - concatenates a valid URL', async () => {
      mockGetConfig.mockReturnValue({ token: 'of my appreciation', serverlessBaseUrl: 'https://all.your.base/' });
      await fetchProtectedApi('/areBelongToUs', requestBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your.base/areBelongToUs',
        expect.objectContaining({
          method: 'POST',
        }),
      );
      mockGetConfig.mockReturnValue({ token: 'of my appreciation', serverlessBaseUrl: 'https://all.your/base/' });
      await fetchProtectedApi('/areBelongToUs', requestBody);
      expect(fetch).toHaveBeenCalledWith(
        'https://all.your/base/areBelongToUs',
        expect.objectContaining({
          method: 'POST',
        }),
      );
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
