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

import { validator } from 'twilio-flex-token-validator';
import { getAccountAuthToken } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '../../../src/Result';
import { AccountScopedRoute, HttpRequest } from '../../../src/httpTypes';
import { validateFlexTokenRequest } from '../../../src/validation/flexToken';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';

jest.mock('twilio-flex-token-validator', () => ({
  validator: jest.fn(),
}));

jest.mock('@tech-matters/twilio-configuration', () => ({
  getAccountAuthToken: jest.fn(),
}));

const mockValidator = validator as jest.MockedFunction<typeof validator>;
const mockGetAccountAuthToken = getAccountAuthToken as jest.MockedFunction<
  typeof getAccountAuthToken
>;

const baseRequest: HttpRequest = {
  method: 'GET',
  headers: {},
  path: '/configuration/twilio',
  query: {},
  body: {},
};

const routeContext = {
  accountSid: TEST_ACCOUNT_SID,
} as AccountScopedRoute;

describe('validateFlexTokenRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccountAuthToken.mockResolvedValue('account-auth-token');
    mockValidator.mockResolvedValue({
      worker_sid: 'WK123',
      roles: ['agent'],
    } as any);
  });

  test('accepts bearer token from authorization header', async () => {
    const request = {
      ...baseRequest,
      headers: {
        authorization: ['Bearer', 'from-header-token'].join(' '),
      },
      body: {},
    };

    const result = await validateFlexTokenRequest({ tokenMode: 'agent' })(
      request,
      routeContext,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result) && 'tokenResult' in result.data) {
      expect(result.data.tokenResult.worker_sid).toBe('WK123');
    }
    expect(mockValidator).toHaveBeenCalledWith(
      'from-header-token',
      TEST_ACCOUNT_SID,
      'account-auth-token',
    );
  });

  test('falls back to Token from body when no authorization header is present', async () => {
    const request = {
      ...baseRequest,
      body: {
        Token: 'from-body-token',
      },
    };

    const result = await validateFlexTokenRequest({ tokenMode: 'agent' })(
      request,
      routeContext,
    );

    expect(isOk(result)).toBe(true);
    expect(mockValidator).toHaveBeenCalledWith(
      'from-body-token',
      TEST_ACCOUNT_SID,
      'account-auth-token',
    );
  });

  test('returns missing-parameter error when no token is provided', async () => {
    const result = await validateFlexTokenRequest({ tokenMode: 'agent' })(
      baseRequest,
      routeContext,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('Token body parameter missing');
    }
    expect(mockValidator).not.toHaveBeenCalled();
  });
});
