/**
 * Copyright (C) 2021-2026 Technology Matters
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

import fetchProtectedApi from '../../services/fetchProtectedApi';
import { getHrmConfig } from '../../hrmConfig';
import { getValidToken } from '../../authentication';
import { ApiError, fetchApi } from '../../services/fetchApi';
import { getFromAccountScopedLambda, postToAccountScopedLambda } from '../../services/fetchAccountScopedLambdaApi';

jest.mock('../../services/fetchProtectedApi');
jest.mock('../../hrmConfig', () => ({
  getHrmConfig: jest.fn(),
}));
jest.mock('../../authentication', () => ({
  getValidToken: jest.fn(),
}));
jest.mock('../../services/fetchApi', () => {
  const actual = jest.requireActual('../../services/fetchApi');
  return {
    ...actual,
    fetchApi: jest.fn(),
  };
});

const mockFetchProtectedApi = fetchProtectedApi as jest.MockedFunction<typeof fetchProtectedApi>;
const mockGetHrmConfig = getHrmConfig as jest.MockedFunction<typeof getHrmConfig>;
const mockGetValidToken = getValidToken as jest.MockedFunction<typeof getValidToken>;
const mockFetchApi = fetchApi as jest.MockedFunction<typeof fetchApi>;

describe('fetchAccountScopedLambdaApi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetHrmConfig.mockReturnValue({
      accountScopedLambdaBaseUrl: 'https://account-scoped.example.com',
    } as ReturnType<typeof getHrmConfig>);
    mockGetValidToken.mockReturnValue('valid-token');
  });

  test('postToAccountScopedLambda delegates to fetchProtectedApi with useTwilioLambda enabled', async () => {
    const body = { test: 'value' };
    const fetchOptions = { useJsonEncode: true };

    await postToAccountScopedLambda('configuration/twilio', body, fetchOptions);

    expect(mockFetchProtectedApi).toHaveBeenCalledWith('configuration/twilio', body, {
      useJsonEncode: true,
      useTwilioLambda: true,
    });
  });

  test('getFromAccountScopedLambda uses GET and bearer authorization header', async () => {
    const response = { quickDialOptions: [] };
    mockFetchApi.mockResolvedValue(response);

    await expect(
      getFromAccountScopedLambda('configuration/twilio', {
        headers: { 'X-Test-Header': 'true' },
      }),
    ).resolves.toStrictEqual(response);

    expect(mockFetchApi).toHaveBeenCalledWith(
      new URL('https://account-scoped.example.com'),
      'configuration/twilio',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: expect.any(String),
          'X-Test-Header': 'true',
        }),
      }),
    );
    const [, , fetchOptions] = mockFetchApi.mock.calls[0];
    expect((fetchOptions.headers as Record<string, string>).Authorization).toContain('valid-token');
  });

  test('getFromAccountScopedLambda throws ApiError when token is unavailable', async () => {
    const tokenError = new Error('token missing');
    mockGetValidToken.mockReturnValue(tokenError);

    await expect(getFromAccountScopedLambda('configuration/twilio')).rejects.toEqual(
      new ApiError('Aborting request due to token issue: token missing', {}, tokenError),
    );
    expect(mockFetchApi).not.toHaveBeenCalled();
  });
});
