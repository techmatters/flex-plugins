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

import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { channelTypes } from '@tech-matters/twilio-types';
import { recordingCompleteCallback } from '../../../src/voicemail/recordingCompleteCallback';
import { isErr, isOk } from '@tech-matters/result-type';
import type { HttpRequest } from '../../../src/httpTypes';
import { TEST_ACCOUNT_SID, TEST_WORKSPACE_SID } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetWorkspaceSid = getWorkspaceSid as jest.MockedFunction<
  typeof getWorkspaceSid
>;

const TEST_CALL_SID = 'CAtest123';
const TEST_RECORDING_SID = 'REtest123';
const TEST_FROM = '+12025551234';
const TEST_WORKFLOW_SID = 'WWtest123';
const TEST_TASK_SID = 'WTtest123';
const RECORDING_START_TIME = new Date('2023-01-01T10:00:00Z');
const CALL_START_TIME = new Date('2023-01-01T09:55:00Z');

const createRequest = (body: Record<string, unknown>): HttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/voicemail/recordingCompleteCallback',
  query: {},
  body,
});

const mockTasksCreate = jest.fn();
const mockRecordingFetch = jest.fn();
const mockCallFetch = jest.fn();

const createMockClient = () => ({
  recordings: {
    get: jest.fn().mockReturnValue({ fetch: mockRecordingFetch }),
  },
  calls: {
    get: jest.fn().mockReturnValue({ fetch: mockCallFetch }),
  },
  taskrouter: {
    v1: {
      workspaces: jest.fn().mockReturnValue({
        tasks: {
          create: mockTasksCreate,
        },
      }),
    },
  },
});

describe('recordingCompleteCallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID);
    mockRecordingFetch.mockResolvedValue({ startTime: RECORDING_START_TIME });
    mockCallFetch.mockResolvedValue({ startTime: CALL_START_TIME });
    mockTasksCreate.mockResolvedValue({ sid: TEST_TASK_SID });
    mockGetTwilioClient.mockResolvedValue(createMockClient() as any);
  });

  test('returns missing parameter error when callSid is absent', async () => {
    const request = createRequest({ from: TEST_FROM, recordingSid: TEST_RECORDING_SID });
    const result = await recordingCompleteCallback(request, TEST_ACCOUNT_SID);
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
  });

  test('returns missing parameter error when from is absent', async () => {
    const request = createRequest({
      callSid: TEST_CALL_SID,
      recordingSid: TEST_RECORDING_SID,
    });
    const result = await recordingCompleteCallback(request, TEST_ACCOUNT_SID);
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
    }
  });

  test('creates a voicemail task with recording start time when recording is found', async () => {
    const request = createRequest({
      from: TEST_FROM,
      callSid: TEST_CALL_SID,
      recordingSid: TEST_RECORDING_SID,
      voicemailWorkflowSid: TEST_WORKFLOW_SID,
    });

    const result = await recordingCompleteCallback(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    expect(mockTasksCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowSid: TEST_WORKFLOW_SID,
        taskChannel: channelTypes.VOICEMAIL,
        timeout: 604800,
        attributes: expect.stringContaining(
          `"receivedTime":"${RECORDING_START_TIME.toISOString()}"`,
        ),
      }),
    );

    const createdAttributes = JSON.parse(mockTasksCreate.mock.calls[0][0].attributes);
    expect(createdAttributes).toMatchObject({
      from: TEST_FROM,
      callSid: TEST_CALL_SID,
      channelType: channelTypes.VOICEMAIL,
      customChannelType: channelTypes.VOICEMAIL,
      callbackAttempts: [],
      maxCallbackAttempts: 3,
      receivedTime: RECORDING_START_TIME.toISOString(),
    });
  });

  test('falls back to call start time when recording fetch fails', async () => {
    mockRecordingFetch.mockRejectedValue(new Error('Recording not found'));

    const request = createRequest({
      from: TEST_FROM,
      callSid: TEST_CALL_SID,
      recordingSid: TEST_RECORDING_SID,
      voicemailWorkflowSid: TEST_WORKFLOW_SID,
    });

    const result = await recordingCompleteCallback(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    const createdAttributes = JSON.parse(mockTasksCreate.mock.calls[0][0].attributes);
    expect(createdAttributes.receivedTime).toBe(CALL_START_TIME.toISOString());
  });

  test('falls back to current time when both recording and call fetch fail', async () => {
    mockRecordingFetch.mockRejectedValue(new Error('Recording not found'));
    mockCallFetch.mockRejectedValue(new Error('Call not found'));

    const beforeTime = Date.now();
    const request = createRequest({
      from: TEST_FROM,
      callSid: TEST_CALL_SID,
      recordingSid: TEST_RECORDING_SID,
      voicemailWorkflowSid: TEST_WORKFLOW_SID,
    });

    const result = await recordingCompleteCallback(request, TEST_ACCOUNT_SID);
    const afterTime = Date.now();

    expect(isOk(result)).toBe(true);
    const createdAttributes = JSON.parse(mockTasksCreate.mock.calls[0][0].attributes);
    const receivedTimeMs = new Date(createdAttributes.receivedTime).getTime();
    expect(receivedTimeMs).toBeGreaterThanOrEqual(beforeTime);
    expect(receivedTimeMs).toBeLessThanOrEqual(afterTime);
  });

  test('merges routingAttributes into task attributes', async () => {
    const routingAttributes = { queueName: 'voicemail-queue', priority: 10 };
    const request = createRequest({
      from: TEST_FROM,
      callSid: TEST_CALL_SID,
      recordingSid: TEST_RECORDING_SID,
      voicemailWorkflowSid: TEST_WORKFLOW_SID,
      routingAttributes,
    });

    await recordingCompleteCallback(request, TEST_ACCOUNT_SID);

    const createdAttributes = JSON.parse(mockTasksCreate.mock.calls[0][0].attributes);
    expect(createdAttributes).toMatchObject({
      routingAttributes: {
        queueName: 'voicemail-queue',
        priority: 10,
      },
      from: TEST_FROM,
      channelType: channelTypes.VOICEMAIL,
    });
  });

  test('uses provided maxCallbackAttempts instead of default', async () => {
    const request = createRequest({
      from: TEST_FROM,
      callSid: TEST_CALL_SID,
      recordingSid: TEST_RECORDING_SID,
      voicemailWorkflowSid: TEST_WORKFLOW_SID,
      maxCallbackAttempts: 5,
    });

    await recordingCompleteCallback(request, TEST_ACCOUNT_SID);

    const createdAttributes = JSON.parse(mockTasksCreate.mock.calls[0][0].attributes);
    expect(createdAttributes.maxCallbackAttempts).toBe(5);
  });

  test('proceeds without recording start time when recordingSid is absent', async () => {
    const request = createRequest({
      from: TEST_FROM,
      callSid: TEST_CALL_SID,
      voicemailWorkflowSid: TEST_WORKFLOW_SID,
    });

    // With no recordingSid, the recording fetch will be called with undefined and may fail
    mockRecordingFetch.mockRejectedValue(new Error('No recording SID'));

    const result = await recordingCompleteCallback(request, TEST_ACCOUNT_SID);

    // Should still succeed, falling back to call or current time
    expect(isOk(result)).toBe(true);
  });

  test('returns the created task in the ok result', async () => {
    const createdTask = { sid: TEST_TASK_SID, attributes: '{}' };
    mockTasksCreate.mockResolvedValue(createdTask);

    const request = createRequest({
      from: TEST_FROM,
      callSid: TEST_CALL_SID,
      recordingSid: TEST_RECORDING_SID,
      voicemailWorkflowSid: TEST_WORKFLOW_SID,
    });

    const result = await recordingCompleteCallback(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.createdVoicemailTask).toBe(createdTask);
    }
  });
});
