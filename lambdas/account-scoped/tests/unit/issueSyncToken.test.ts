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

import { issueSyncToken, issueSyncTokenHandler } from '../../src/issueSyncToken';
import { getSyncServiceSid } from '@tech-matters/twilio-configuration';
import { getApiKey, getApiSecret } from '../../src/webchatAuthentication/createToken';
import { isErr, isOk } from '../../src/Result';
import { FlexValidatedHttpRequest } from '../../src/validation/flexToken';
import { TEST_ACCOUNT_SID, TEST_CHAT_SERVICE_SID, TEST_WORKER_SID } from '../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getSyncServiceSid: jest.fn(),
}));

jest.mock('../../src/webchatAuthentication/createToken', () => ({
  getApiKey: jest.fn(),
  getApiSecret: jest.fn(),
}));

jest.mock('twilio', () => {
  const mockToJwt = jest.fn().mockReturnValue('mock.jwt.token');
  const mockAddGrant = jest.fn();
  const mockSyncGrant = jest.fn().mockImplementation(() => ({}));
  const mockAccessToken: any = jest.fn().mockImplementation(() => ({
    addGrant: mockAddGrant,
    toJwt: mockToJwt,
  }));
  mockAccessToken.SyncGrant = mockSyncGrant;

  return {
    jwt: {
      AccessToken: mockAccessToken,
    },
  };
});

const mockGetSyncServiceSid = getSyncServiceSid as jest.MockedFunction<
  typeof getSyncServiceSid
>;
const mockGetApiKey = getApiKey as jest.MockedFunction<typeof getApiKey>;
const mockGetApiSecret = getApiSecret as jest.MockedFunction<typeof getApiSecret>;

const TEST_SYNC_SERVICE_SID = TEST_CHAT_SERVICE_SID;
const TEST_API_KEY = 'SK_test_api_key';
const TEST_API_SECRET = 'test_api_secret';
const TEST_IDENTITY = 'test_worker_identity';

const createMockRequest = (tokenResult: any): FlexValidatedHttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body: {},
  tokenResult,
});

describe('issueSyncToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSyncServiceSid.mockResolvedValue(TEST_SYNC_SERVICE_SID);
    mockGetApiKey.mockResolvedValue(TEST_API_KEY);
    mockGetApiSecret.mockResolvedValue(TEST_API_SECRET);
  });

  it('should return a JWT token string', async () => {
    const token = await issueSyncToken(TEST_ACCOUNT_SID, TEST_IDENTITY);
    expect(token).toBe('mock.jwt.token');
    expect(mockGetSyncServiceSid).toHaveBeenCalledWith(TEST_ACCOUNT_SID);
    expect(mockGetApiKey).toHaveBeenCalledWith(TEST_ACCOUNT_SID);
    expect(mockGetApiSecret).toHaveBeenCalledWith(TEST_ACCOUNT_SID);
  });
});

describe('issueSyncTokenHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSyncServiceSid.mockResolvedValue(TEST_SYNC_SERVICE_SID);
    mockGetApiKey.mockResolvedValue(TEST_API_KEY);
    mockGetApiSecret.mockResolvedValue(TEST_API_SECRET);
  });

  it('should return 400 when identity is missing from token result', async () => {
    const request = createMockRequest({ worker_sid: TEST_WORKER_SID, roles: ['agent'] });
    const result = await issueSyncTokenHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toBe('Identity is missing from token');
    }
  });

  it('should return a token when identity is present', async () => {
    const request = createMockRequest({
      worker_sid: TEST_WORKER_SID,
      roles: ['agent'],
      identity: TEST_IDENTITY,
    });
    const result = await issueSyncTokenHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect((result.data as any).token).toBe('mock.jwt.token');
    }
  });

  it('should return 500 when an unexpected error occurs', async () => {
    mockGetSyncServiceSid.mockRejectedValue(new Error('SSM lookup failed'));

    const request = createMockRequest({
      worker_sid: TEST_WORKER_SID,
      roles: ['agent'],
      identity: TEST_IDENTITY,
    });
    const result = await issueSyncTokenHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toContain('SSM lookup failed');
    }
  });
});
