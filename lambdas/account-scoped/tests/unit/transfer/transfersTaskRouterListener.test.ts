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

import twilio from 'twilio';
import { handleEvent } from '../../../src/transfer/transfersTaskRouterListener';
import { EventFields } from '../../../src/taskrouter';
import { RecursivePartial } from '../RecursivePartial';
import {
  TEST_ACCOUNT_SID,
  TEST_TASK_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';
import {
  newMockTwilioClientWithConfigurationAttributes,
  setConfigurationAttributes,
} from '../mockServiceConfiguration';
import {
  RESERVATION_ACCEPTED,
  RESERVATION_REJECTED,
  RESERVATION_TIMEOUT,
  RESERVATION_WRAPUP,
  TASK_QUEUE_ENTERED,
} from '../../../src/taskrouter/eventTypes';
import { TaskContext, TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { WorkspaceContext } from 'twilio/lib/rest/taskrouter/v1/workspace';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getWorkspaceSid: jest.fn().mockResolvedValue('WSut'),
}));

const ORIGINAL_TASK_SID = 'WToriginal';
const ORIGINAL_RESERVATION_SID = 'WRoriginal';
const CHANNEL_SID = 'CHchannel';

const buildTransferMeta = (overrides: Record<string, unknown> = {}) => ({
  mode: 'COLD' as const,
  transferStatus: 'accepted' as const,
  sidWithTaskControl: ORIGINAL_RESERVATION_SID,
  originalReservation: ORIGINAL_RESERVATION_SID,
  originalTask: ORIGINAL_TASK_SID,
  ...overrides,
});

const newEventFields = (
  taskChannelUniqueName: string,
  eventType: string,
  taskAttributes: Record<string, unknown> = {},
): EventFields =>
  ({
    EventType: eventType,
    TaskSid: TEST_TASK_SID,
    TaskChannelUniqueName: taskChannelUniqueName,
    TaskAttributes: JSON.stringify({
      channelSid: CHANNEL_SID,
      ...taskAttributes,
    }),
  }) as EventFields;

describe('transfersTaskRouterListener', () => {
  let mockUpdateTask: jest.MockedFunction<TaskContext['update']>;
  let mockFetchTask: jest.MockedFunction<TaskContext['fetch']>;
  let mockUpdateReservation: jest.Mock;
  let client: twilio.Twilio;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdateTask = jest.fn();
    mockFetchTask = jest.fn();
    mockUpdateReservation = jest.fn();

    const mockTwilioClient: RecursivePartial<twilio.Twilio> = {
      taskrouter: {
        v1: {
          workspaces: {
            get: (workspaceSid: string) => {
              if (workspaceSid === TEST_WORKSPACE_SID) {
                return {
                  tasks: {
                    get: () => ({
                      update: mockUpdateTask as TaskContext['update'],
                      fetch: mockFetchTask as TaskContext['fetch'],
                      reservations: {
                        get: () => ({
                          update: mockUpdateReservation,
                        }),
                      },
                    }),
                  },
                } as unknown as WorkspaceContext;
              }
              throw new Error(`Unexpected workspace SID: ${workspaceSid}`);
            },
          },
        },
      },
      flexApi: {
        v1: {
          interaction: {
            get: () => ({
              channels: {
                get: () => ({
                  participants: {
                    list: jest.fn().mockResolvedValue([]),
                  },
                }),
              },
            }),
          },
        },
      },
    };

    client = setConfigurationAttributes(mockTwilioClient as twilio.Twilio, {
      feature_flags: { use_twilio_lambda_transfers: true },
    });
  });

  test('use_twilio_lambda_transfers flag not set - skips without any task updates', async () => {
    const disabledClient = newMockTwilioClientWithConfigurationAttributes({
      feature_flags: { use_twilio_lambda_transfers: false },
    });

    await handleEvent(
      newEventFields('chat', RESERVATION_ACCEPTED, {
        transferMeta: buildTransferMeta(),
        transferTargetType: 'worker',
      }),
      TEST_ACCOUNT_SID,
      disabledClient,
    );

    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  test('chat transfer to worker accepted - completes original task', async () => {
    mockUpdateTask.mockResolvedValue({
      attributes: JSON.stringify({ flexInteractionSid: null }),
    } as TaskInstance);

    await handleEvent(
      newEventFields('chat', RESERVATION_ACCEPTED, {
        transferMeta: buildTransferMeta(),
        transferTargetType: 'worker',
      }),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockUpdateTask).toHaveBeenCalledWith({
      assignmentStatus: 'completed',
      reason: 'task transferred accepted',
    });
  });

  test('chat transfer to queue complete (TASK_QUEUE_ENTERED) - completes original task', async () => {
    mockUpdateTask.mockResolvedValue({
      attributes: JSON.stringify({}),
    } as TaskInstance);

    await handleEvent(
      newEventFields('chat', TASK_QUEUE_ENTERED, {
        transferMeta: buildTransferMeta(),
        transferTargetType: 'queue',
      }),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockUpdateTask).toHaveBeenCalledWith({
      assignmentStatus: 'completed',
      reason: 'task transferred into queue',
    });
  });

  test('chat transfer to worker rejected (RESERVATION_REJECTED) - cancels rejected task and updates both tasks', async () => {
    const originalAttributes = {
      channelSid: 'CHoriginal',
      transferMeta: buildTransferMeta(),
    };
    const rejectedAttributes = {
      channelSid: CHANNEL_SID,
      transferMeta: buildTransferMeta(),
    };
    mockFetchTask
      .mockResolvedValueOnce({
        attributes: JSON.stringify(originalAttributes),
        update: mockUpdateTask as TaskContext['update'],
      } as unknown as TaskInstance)
      .mockResolvedValueOnce({
        attributes: JSON.stringify(rejectedAttributes),
        update: mockUpdateTask as TaskContext['update'],
      } as unknown as TaskInstance);

    await handleEvent(
      newEventFields('chat', RESERVATION_REJECTED, {
        transferMeta: buildTransferMeta(),
        transferTargetType: 'worker',
        channelSid: CHANNEL_SID,
      }),
      TEST_ACCOUNT_SID,
      client,
    );

    // First two updates: one for each task attribute update, third update: cancelation
    expect(mockUpdateTask).toHaveBeenCalledTimes(3);
    expect(mockUpdateTask).toHaveBeenCalledWith({
      assignmentStatus: 'canceled',
      reason: 'task transferred rejected',
    });
  });

  test('chat transfer to worker rejected via RESERVATION_TIMEOUT - treats as rejection', async () => {
    const originalAttributes = {
      channelSid: 'CHoriginal',
      transferMeta: buildTransferMeta(),
    };
    const rejectedAttributes = {
      channelSid: CHANNEL_SID,
      transferMeta: buildTransferMeta(),
    };
    mockFetchTask
      .mockResolvedValueOnce({
        attributes: JSON.stringify(originalAttributes),
        update: mockUpdateTask,
      } as unknown as TaskInstance)
      .mockResolvedValueOnce({
        attributes: JSON.stringify(rejectedAttributes),
        update: mockUpdateTask,
      } as unknown as TaskInstance);

    await handleEvent(
      newEventFields('chat', RESERVATION_TIMEOUT, {
        transferMeta: buildTransferMeta(),
        transferTargetType: 'worker',
        channelSid: CHANNEL_SID,
      }),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockUpdateTask).toHaveBeenCalledWith({
      assignmentStatus: 'canceled',
      reason: 'task transferred rejected',
    });
  });

  test('warm voice transfer rejected (RESERVATION_REJECTED) - updates task transferStatus to rejected', async () => {
    const taskAttributes = {
      transferMeta: buildTransferMeta({ mode: 'WARM', transferStatus: 'transferring' }),
    };
    mockUpdateTask.mockResolvedValue({} as TaskInstance);

    await handleEvent(
      newEventFields('voice', RESERVATION_REJECTED, taskAttributes),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockUpdateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.stringContaining('"transferStatus":"rejected"'),
      }),
    );
  });

  test('warm voice transfer timed out (RESERVATION_TIMEOUT) - updates task transferStatus to timeout', async () => {
    const taskAttributes = {
      transferMeta: buildTransferMeta({ mode: 'WARM', transferStatus: 'transferring' }),
    };
    mockUpdateTask.mockResolvedValue({} as TaskInstance);

    await handleEvent(
      newEventFields('voice', RESERVATION_TIMEOUT, taskAttributes),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockUpdateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.stringContaining('"transferStatus":"timeout"'),
      }),
    );
  });

  test('voice transfer original in wrapup (RESERVATION_WRAPUP) - completes original reservation', async () => {
    const taskAttributes = {
      transferMeta: buildTransferMeta({ mode: 'COLD', transferStatus: 'accepted' }),
    };
    mockUpdateReservation.mockResolvedValue({});

    await handleEvent(
      newEventFields('voice', RESERVATION_WRAPUP, taskAttributes),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockUpdateReservation).toHaveBeenCalledWith({
      reservationStatus: 'completed',
    });
  });

  test('unhandled event combination - completes without any task update', async () => {
    await handleEvent(
      newEventFields('voice', RESERVATION_ACCEPTED, {}),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  test('handler throws - error is re-thrown', async () => {
    const error = new Error('Update failed');
    mockUpdateTask.mockRejectedValue(error);

    await expect(
      handleEvent(
        newEventFields('chat', RESERVATION_ACCEPTED, {
          transferMeta: buildTransferMeta(),
          transferTargetType: 'worker',
        }),
        TEST_ACCOUNT_SID,
        client,
      ),
    ).rejects.toThrow('Update failed');
  });
});
