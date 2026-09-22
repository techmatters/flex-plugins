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

import { isErr, isOk } from '@tech-matters/result-type';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import {
  createScheduledJob,
  isValidVoicemailTask,
  ScheduledJobType,
} from '@tech-matters/scheduled-jobs';
import { retrieveServiceConfigurationAttributes } from '../../../src/configuration/aseloConfiguration';
import { handleCreateScheduleJob } from '../../../src/scheduled-jobs/create-schedule';
import { HttpRequest } from '../../../src/httpTypes';

jest.mock(
  '@tech-matters/twilio-configuration',
  () => ({
    getTwilioClient: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  '@tech-matters/scheduled-jobs',
  () => ({
    createScheduledJob: jest.fn(),
    isValidVoicemailTask: jest.fn(),
  }),
  { virtual: true },
);

jest.mock('../../../src/configuration/aseloConfiguration', () => ({
  retrieveServiceConfigurationAttributes: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockCreateScheduledJob = createScheduledJob as jest.MockedFunction<
  typeof createScheduledJob
>;
const mockIsValidVoicemailTask = isValidVoicemailTask as jest.MockedFunction<
  typeof isValidVoicemailTask
>;
const mockRetrieveServiceConfigurationAttributes =
  retrieveServiceConfigurationAttributes as jest.MockedFunction<
    typeof retrieveServiceConfigurationAttributes
  >;

const ACCOUNT_SID = 'AC123456789' as any;

const baseVoicemailTask = {
  workflowSid: 'WW123',
  attributes: {
    callSid: 'CA123',
    from: '+12025550123',
    name: 'Jane Doe',
    callbackAttempts: [['first', '2026-01-01T00:00:00.000Z'] as [string, string]],
    maxCallbackAttempts: 3,
    routingAttributes: { queue: 'callback' },
  },
};

const createRequest = (body: Record<string, unknown>): HttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/scheduled-jobs/create-schedule',
  query: {},
  body,
});

describe('handleCreateScheduleJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTwilioClient.mockResolvedValue({} as any);
    mockRetrieveServiceConfigurationAttributes.mockResolvedValue({
      voicemail_schedule_retry_later_minutes: 30,
    } as any);
    mockIsValidVoicemailTask.mockReturnValue(true);
    mockCreateScheduledJob.mockResolvedValue({} as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns 400 when jobType is not supported', async () => {
    const result = await handleCreateScheduleJob(
      createRequest({ jobType: 'unsupported-job' }),
      ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toBe(
        'Invalid job type, not supported by user facing handler',
      );
    }
  });

  test('returns 400 when voicemailTask is invalid', async () => {
    mockIsValidVoicemailTask.mockReturnValue(false);

    const result = await handleCreateScheduleJob(
      createRequest({
        jobType: 'create-voicemail-schedule',
        voicemailTask: baseVoicemailTask,
      }),
      ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toBe('Invalid voicemailTask parameter');
    }
    expect(mockCreateScheduledJob).not.toHaveBeenCalled();
  });

  test('creates scheduled job and returns schedule name for valid voicemail task', async () => {
    const fixedNow = new Date('2026-01-01T00:00:00.000Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    const result = await handleCreateScheduleJob(
      createRequest({
        jobType: 'create-voicemail-schedule',
        voicemailTask: baseVoicemailTask,
      }),
      ACCOUNT_SID,
    );

    expect(mockGetTwilioClient).toHaveBeenCalledWith(ACCOUNT_SID);
    expect(mockRetrieveServiceConfigurationAttributes).toHaveBeenCalled();
    const expectedScheduledJob: ScheduledJobType = {
      jobType: 'create-voicemail-schedule',
      voicemailTask: {
        accountSid: ACCOUNT_SID,
        workflowSid: baseVoicemailTask.workflowSid,
        attributes: baseVoicemailTask.attributes,
      },
    };
    expect(mockCreateScheduledJob).toHaveBeenCalledWith({
      scheduledJob: expectedScheduledJob,
      scheduleName: 'create-voicemail-schedule-CA123',
      scheduleExpression: 'at(2026-01-01T00:30:00)',
    });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toBe('create-voicemail-schedule-CA123');
    }
  });

  test('uses default retry minutes when config value is absent', async () => {
    const fixedNow = new Date('2026-01-01T00:00:00.000Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);
    mockRetrieveServiceConfigurationAttributes.mockResolvedValue({} as any);

    await handleCreateScheduleJob(
      createRequest({
        jobType: 'create-voicemail-schedule',
        voicemailTask: baseVoicemailTask,
      }),
      ACCOUNT_SID,
    );

    expect(mockCreateScheduledJob).toHaveBeenCalledWith(
      expect.objectContaining({
        scheduleExpression: 'at(2026-01-02T00:00:00)',
      }),
    );
  });

  test('returns 500 when dependency throws', async () => {
    mockGetTwilioClient.mockRejectedValue(new Error('twilio unavailable'));

    const result = await handleCreateScheduleJob(
      createRequest({
        jobType: 'create-voicemail-schedule',
        voicemailTask: baseVoicemailTask,
      }),
      ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toBe('twilio unavailable');
    }
  });
});
