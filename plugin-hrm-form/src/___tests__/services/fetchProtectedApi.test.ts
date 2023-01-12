import { getConfig } from '../../HrmFormPlugin';
import fetchProtectedApi from '../../services/fetchProtectedApi';

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
      const bodyParams: URLSearchParams = mockFetch.mock.calls[0][1].body;
      expect(bodyParams.toString()).toBe(new URLSearchParams({ ...requestBody, Token: 'of my appreciation'}).toString());
    });
  });
});
