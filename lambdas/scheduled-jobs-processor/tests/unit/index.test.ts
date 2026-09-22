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

import type { Context } from 'aws-lambda';
import { createVoicemailTask } from '@tech-matters/voicemail';
import { handler } from '../../src';

jest.mock(
  '@tech-matters/voicemail',
  () => ({
    createVoicemailTask: jest.fn(),
  }),
  { virtual: true },
);

const mockCreateVoicemailTask = createVoicemailTask as jest.MockedFunction<
  typeof createVoicemailTask
>;

const context = {
  awsRequestId: 'request-id',
} as Context;

describe('scheduled-jobs-processor handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('processes create-voicemail-schedule job and returns unwrapped result', async () => {
    mockCreateVoicemailTask.mockResolvedValue({
      unwrap: () => 'created-task',
    } as any);

    const result = await handler(
      {
        jobType: 'create-voicemail-schedule',
        voicemailTask: {
          accountSid: 'AC123' as any,
          workflowSid: 'WW123',
          attributes: {
            callSid: 'CA123',
            from: '+12025550123',
            name: 'Jane Doe',
            callbackAttempts: [],
          },
        },
      },
      context,
    );

    expect(mockCreateVoicemailTask).toHaveBeenCalledWith(
      expect.objectContaining({
        accountSid: 'AC123',
        workflowSid: 'WW123',
        callSid: 'CA123',
        from: '+12025550123',
        name: 'Jane Doe',
        callbackAttempts: [],
        routingAttributes: {},
        receivedTime: expect.any(String),
      }),
    );
    expect(result).toBe('created-task');
  });

  test('returns undefined and warns for unsupported job type', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = await handler({ jobType: 'unsupported-job' } as any, context);

    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith('Job type unsupported-job not supported');
  });

  test('logs and swallows errors while processing jobs', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreateVoicemailTask.mockRejectedValue(new Error('unable to create task'));

    const result = await handler(
      {
        jobType: 'create-voicemail-schedule',
        voicemailTask: {
          accountSid: 'AC123' as any,
          workflowSid: 'WW123',
          attributes: {
            callSid: 'CA123',
            from: '+12025550123',
            name: 'Jane Doe',
            callbackAttempts: [],
          },
        },
      },
      context,
    );

    expect(result).toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });
});
