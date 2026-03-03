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

import { getMediaUrlHandler } from '../../../src/conversation/getMediaUrl';
import { getAccountAuthToken } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '../../../src/Result';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import { TEST_ACCOUNT_SID, TEST_AUTH_TOKEN } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getAccountAuthToken: jest.fn(),
}));

const mockGetAccountAuthToken = getAccountAuthToken as jest.MockedFunction<
  typeof getAccountAuthToken
>;

global.fetch = jest.fn();

const TEST_SERVICE_SID = 'ISservice00000000000000000000000000';
const TEST_MEDIA_SID = 'ME00000000000000000000000000000000';
const TEST_MEDIA_URL =
  'https://mcs.us1.twilio.com/v1/Services/IS.../Media/ME.../Content?token=xyz';

const createMockRequest = (body: any): FlexValidatedHttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
  tokenResult: { worker_sid: 'WK1234', roles: ['agent'] },
});

describe('getMediaUrlHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccountAuthToken.mockResolvedValue(TEST_AUTH_TOKEN);
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it('should return 400 when serviceSid is missing', async () => {
    const request = createMockRequest({ mediaSid: TEST_MEDIA_SID });

    const result = await getMediaUrlHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain('serviceSid');
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should return 400 when mediaSid is missing', async () => {
    const request = createMockRequest({ serviceSid: TEST_SERVICE_SID });

    const result = await getMediaUrlHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain('mediaSid');
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should return the content_direct_temporary URL on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue({
        links: { content_direct_temporary: TEST_MEDIA_URL },
      }),
    });

    const request = createMockRequest({
      serviceSid: TEST_SERVICE_SID,
      mediaSid: TEST_MEDIA_SID,
    });

    const result = await getMediaUrlHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toBe(TEST_MEDIA_URL);
    }

    expect(global.fetch).toHaveBeenCalledWith(
      `https://mcs.us1.twilio.com/v1/Services/${TEST_SERVICE_SID}/Media/${TEST_MEDIA_SID}`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Basic /),
        }),
      }),
    );

    // Verify the Authorization header uses account SID and auth token
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const expectedCredentials = Buffer.from(
      `${TEST_ACCOUNT_SID}:${TEST_AUTH_TOKEN}`,
    ).toString('base64');
    expect(fetchCall[1].headers.Authorization).toBe(`Basic ${expectedCredentials}`);
  });

  it('should return error when fetch response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: jest.fn().mockResolvedValue({ status: 404, message: 'Not found' }),
    });

    const request = createMockRequest({
      serviceSid: TEST_SERVICE_SID,
      mediaSid: TEST_MEDIA_SID,
    });

    const result = await getMediaUrlHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(404);
    }
  });

  it('should return 500 on unexpected error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const request = createMockRequest({
      serviceSid: TEST_SERVICE_SID,
      mediaSid: TEST_MEDIA_SID,
    });

    const result = await getMediaUrlHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toBe('Network error');
      expect(result.error.statusCode).toBe(500);
    }
  });
});
