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

const mockSend = jest.fn();
const mockSchedulerClient = jest.fn(() => ({ send: mockSend }));
const mockCreateScheduleCommand = jest.fn(input => ({ input }));

jest.mock('@aws-sdk/client-scheduler', () => ({
  ActionAfterCompletion: { DELETE: 'DELETE' },
  CreateScheduleCommand: mockCreateScheduleCommand,
  FlexibleTimeWindowMode: { OFF: 'OFF' },
  SchedulerClient: mockSchedulerClient,
}));

import { createScheduledJob } from '../../src/create-schedule';
import { ScheduledJobType } from '../../src/scheduled-job';

describe('createScheduledJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SCHEDULER_GROUP_NAME = 'test-group';
    process.env.SCHEDULED_JOBS_PROCESSOR_LAMBDA_ARN = 'arn:aws:lambda:processor';
    process.env.SCHEDULED_JOBS_EXECUTION_ROLE_ARN = 'arn:aws:iam:role/scheduler';
  });

  test('creates schedule command with expected payload and sends it', async () => {
    const scheduledJob: ScheduledJobType = {
      jobType: 'create-voicemail-schedule',
      voicemailTask: {
        accountSid: 'AC123' as any,
        workflowSid: 'WW123',
        attributes: {
          callSid: 'CA123',
          from: '+12025550123',
          name: 'Jane',
          callbackAttempts: [],
          routingAttributes: { queue: 'queue-1' },
          maxCallbackAttempts: 3,
        },
      },
    };

    const createdSchedule = { ScheduleArn: 'arn:schedule' };
    mockSend.mockResolvedValue(createdSchedule);

    const result = await createScheduledJob({
      scheduledJob,
      scheduleName: 'create-voicemail-schedule-CA123',
      scheduleExpression: 'at(2026-01-01T00:00:00)',
    });

    expect(mockSchedulerClient).toHaveBeenCalledWith({});
    expect(mockCreateScheduleCommand).toHaveBeenCalledWith({
      Name: 'create-voicemail-schedule-CA123',
      GroupName: 'test-group',
      ScheduleExpression: 'at(2026-01-01T00:00:00)',
      ScheduleExpressionTimezone: 'UTC',
      FlexibleTimeWindow: { Mode: 'OFF' },
      ActionAfterCompletion: 'DELETE',
      Target: {
        Arn: 'arn:aws:lambda:processor',
        RoleArn: 'arn:aws:iam:role/scheduler',
        Input: JSON.stringify(scheduledJob),
      },
    });
    expect(mockSend).toHaveBeenCalledWith({
      input: expect.objectContaining({ Name: 'create-voicemail-schedule-CA123' }),
    });
    expect(result).toEqual(createdSchedule);
  });
});
