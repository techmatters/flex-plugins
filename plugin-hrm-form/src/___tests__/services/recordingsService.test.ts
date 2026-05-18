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

/* eslint-disable camelcase */
import { getMediaUrl, getExternalRecordingInfo } from '../../services/recordingsService';
import fetchProtectedApi from '../../services/fetchProtectedApi';
import { getAseloFeatureFlags, getHrmConfig } from '../../hrmConfig';

jest.mock('../../services/fetchProtectedApi');
jest.mock('../../hrmConfig');
jest.mock('@twilio/flex-ui', () => ({
  TaskHelper: {
    isCallTask: jest.fn().mockReturnValue(true),
    isChatBasedTask: jest.fn().mockReturnValue(false),
  },
}));
jest.mock('../../fullStory', () => ({ recordEvent: jest.fn() }));
jest.mock('../../states/DomainConstants', () => ({
  isVoiceChannel: jest.fn().mockReturnValue(true),
}));
jest.mock('../../types/types', () => ({
  isOfflineContactTask: jest.fn().mockReturnValue(false),
  isTwilioTask: jest.fn().mockReturnValue(true),
}));

const mockFetchProtectedApi = fetchProtectedApi as jest.MockedFunction<typeof fetchProtectedApi>;
const mockGetAseloFeatureFlags = getAseloFeatureFlags as jest.MockedFunction<typeof getAseloFeatureFlags>;
const mockGetHrmConfig = getHrmConfig as jest.MockedFunction<typeof getHrmConfig>;

const TEST_SERVICE_SID = 'ISservice0000';
const TEST_MEDIA_SID = 'ME000000';
const TEST_MEDIA_URL = 'https://mcs.us1.twilio.com/v1/Services/IS.../Media/ME.../Content?token=xyz';
const TEST_CALL_SID = 'CA00000000000';
const TEST_RECORDING_SID = 'RE00000000000';
const TEST_BUCKET = 'test-docs-bucket';
const TEST_KEY = `voice-recordings/ACtest/${TEST_RECORDING_SID}`;

const makeVoiceTask = () =>
  ({
    taskSid: 'WTtest',
    sid: 'WRtest',
    status: 'assigned',
    channelType: 'voice',
    attributes: {
      conference: { participants: { worker: TEST_CALL_SID } },
    },
  } as any);

beforeEach(() => {
  mockFetchProtectedApi.mockClear();
  mockGetAseloFeatureFlags.mockClear();
  mockGetHrmConfig.mockReturnValue({ externalRecordingsEnabled: true, docsBucket: TEST_BUCKET } as any);
});

describe('getMediaUrl', () => {
  describe('feature flag disabled (serverless)', () => {
    beforeEach(() => {
      mockGetAseloFeatureFlags.mockReturnValue({ use_twilio_lambda_for_recordings_lookup: false } as any);
      mockFetchProtectedApi.mockResolvedValue(TEST_MEDIA_URL);
    });

    test('calls fetchProtectedApi with serverless endpoint', async () => {
      await getMediaUrl(TEST_SERVICE_SID, TEST_MEDIA_SID);
      expect(mockFetchProtectedApi).toHaveBeenCalledWith(
        '/getMediaUrl',
        { serviceSid: TEST_SERVICE_SID, mediaSid: TEST_MEDIA_SID },
        { useTwilioLambda: false },
      );
    });

    test('returns the response', async () => {
      const result = await getMediaUrl(TEST_SERVICE_SID, TEST_MEDIA_SID);
      expect(result).toBe(TEST_MEDIA_URL);
    });
  });

  describe('feature flag enabled (lambda)', () => {
    beforeEach(() => {
      mockGetAseloFeatureFlags.mockReturnValue({ use_twilio_lambda_for_recordings_lookup: true } as any);
      mockFetchProtectedApi.mockResolvedValue(TEST_MEDIA_URL);
    });

    test('calls fetchProtectedApi with lambda endpoint', async () => {
      await getMediaUrl(TEST_SERVICE_SID, TEST_MEDIA_SID);
      expect(mockFetchProtectedApi).toHaveBeenCalledWith(
        '/conversation/getMediaUrl',
        { serviceSid: TEST_SERVICE_SID, mediaSid: TEST_MEDIA_SID },
        { useTwilioLambda: true },
      );
    });

    test('returns the response', async () => {
      const result = await getMediaUrl(TEST_SERVICE_SID, TEST_MEDIA_SID);
      expect(result).toBe(TEST_MEDIA_URL);
    });
  });
});

describe('getExternalRecordingInfo (getExternalRecordingS3Location routing)', () => {
  const recordingResponse = { recordingSid: TEST_RECORDING_SID, bucket: TEST_BUCKET, key: TEST_KEY };
  const expectedRecordingInfo = {
    status: 'success',
    recordingSid: TEST_RECORDING_SID,
    bucket: TEST_BUCKET,
    key: TEST_KEY,
  };

  describe('feature flag disabled (serverless)', () => {
    beforeEach(() => {
      mockGetAseloFeatureFlags.mockReturnValue({ use_twilio_lambda_for_recordings_lookup: false } as any);
      mockFetchProtectedApi.mockResolvedValue(recordingResponse);
    });

    test('calls fetchProtectedApi with serverless endpoint', async () => {
      await getExternalRecordingInfo(makeVoiceTask());
      expect(mockFetchProtectedApi).toHaveBeenCalledWith(
        '/getExternalRecordingS3Location',
        { callSid: TEST_CALL_SID },
        { useTwilioLambda: false },
      );
    });

    test('returns the recording info', async () => {
      const result = await getExternalRecordingInfo(makeVoiceTask());
      expect(result).toMatchObject(expectedRecordingInfo);
    });
  });

  describe('feature flag enabled (lambda)', () => {
    beforeEach(() => {
      mockGetAseloFeatureFlags.mockReturnValue({ use_twilio_lambda_for_recordings_lookup: true } as any);
      mockFetchProtectedApi.mockResolvedValue(recordingResponse);
    });

    test('calls fetchProtectedApi with lambda endpoint', async () => {
      await getExternalRecordingInfo(makeVoiceTask());
      expect(mockFetchProtectedApi).toHaveBeenCalledWith(
        '/conversation/getExternalRecordingS3Location',
        { callSid: TEST_CALL_SID },
        { useTwilioLambda: true },
      );
    });

    test('returns the recording info', async () => {
      const result = await getExternalRecordingInfo(makeVoiceTask());
      expect(result).toMatchObject(expectedRecordingInfo);
    });
  });
});
