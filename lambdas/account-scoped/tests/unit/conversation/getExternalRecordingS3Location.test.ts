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

import { getExternalRecordingS3LocationHandler } from '../../../src/conversation/getExternalRecordingS3Location';
import { getTwilioClient, getDocsBucketName } from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '../../../src/Result';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getDocsBucketName: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetDocsBucketName = getDocsBucketName as jest.MockedFunction<
  typeof getDocsBucketName
>;

const TEST_BUCKET = 'test-docs-bucket';
const TEST_CALL_SID = 'CA00000000000000000000000000000000';
const TEST_RECORDING_SID = 'RE00000000000000000000000000000000';

const createMockRequest = (body: any): FlexValidatedHttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
  tokenResult: { worker_sid: 'WK1234', roles: ['agent'] },
});

describe('getExternalRecordingS3LocationHandler', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDocsBucketName.mockResolvedValue(TEST_BUCKET);
    mockClient = {
      recordings: {
        list: jest.fn(),
      },
    };
    mockGetTwilioClient.mockResolvedValue(mockClient as any);
  });

  it('should return 400 when callSid is missing', async () => {
    const request = createMockRequest({});

    const result = await getExternalRecordingS3LocationHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toContain('callSid');
      expect(result.error.statusCode).toBe(400);
    }
  });

  it('should return 404 when no recordings found', async () => {
    mockClient.recordings.list.mockResolvedValue([]);

    const request = createMockRequest({ callSid: TEST_CALL_SID });

    const result = await getExternalRecordingS3LocationHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toBe('No recording found');
      expect(result.error.statusCode).toBe(404);
    }
  });

  it('should return 409 when more than one recording found', async () => {
    mockClient.recordings.list.mockResolvedValue([
      { sid: TEST_RECORDING_SID },
      { sid: 'RE11111111111111111111111111111111' },
    ]);

    const request = createMockRequest({ callSid: TEST_CALL_SID });

    const result = await getExternalRecordingS3LocationHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toBe('More than one recording found');
      expect(result.error.statusCode).toBe(409);
    }
  });

  it('should return recordingSid, key and bucket when exactly one recording found', async () => {
    mockClient.recordings.list.mockResolvedValue([{ sid: TEST_RECORDING_SID }]);

    const request = createMockRequest({ callSid: TEST_CALL_SID });

    const result = await getExternalRecordingS3LocationHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.recordingSid).toBe(TEST_RECORDING_SID);
      expect(result.data.key).toBe(
        `voice-recordings/${TEST_ACCOUNT_SID}/${TEST_RECORDING_SID}`,
      );
      expect(result.data.bucket).toBe(TEST_BUCKET);
    }
    expect(mockClient.recordings.list).toHaveBeenCalledWith({
      callSid: TEST_CALL_SID,
      limit: 20,
    });
  });

  it('should return 500 on unexpected error', async () => {
    mockClient.recordings.list.mockRejectedValue(new Error('Twilio API error'));

    const request = createMockRequest({ callSid: TEST_CALL_SID });

    const result = await getExternalRecordingS3LocationHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.message).toBe('Twilio API error');
      expect(result.error.statusCode).toBe(500);
    }
  });
});
