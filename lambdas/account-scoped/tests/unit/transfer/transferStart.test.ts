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
import { transferStartHandler } from '../../../src/transfer/transferStart';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import { RecursivePartial } from '../RecursivePartial';
import { isErr, isOk } from '@tech-matters/result-type';
import {
  getTwilioClient,
  getMasterWorkflowSid,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { TEST_ACCOUNT_SID, TEST_WORKSPACE_SID } from '../../testTwilioValues';
import { HttpError } from '../../../src/httpTypes';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn(),
  getMasterWorkflowSid: jest.fn(),
  getConversationsTransferWorkflow: jest.fn(),
}));

jest.mock('../../../src/conversation/adjustChatCapacity', () => ({
  adjustChatCapacity: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetWorkspaceSid = getWorkspaceSid as jest.MockedFunction<
  typeof getWorkspaceSid
>;
const mockGetMasterWorkflowSid = getMasterWorkflowSid as jest.MockedFunction<
  typeof getMasterWorkflowSid
>;

const TASK_SID = 'WToriginal';
const ORIGINAL_WORKER_SID = 'WKoriginal';
const ORIGINAL_RESERVATION_SID = 'WRoriginal';
const SUPERVISOR_WORKER_SID = 'WKsupervisor';
const NEW_TASK_SID = 'WTnew';
const CHANNEL_SID = 'CHoriginal';
const DUMMY_RESERVATION_SID = 'WR00000000000000000000000000000000';

const ORIGINAL_TASK_ATTRIBUTES = {
  channelSid: CHANNEL_SID,
  channelType: 'web',
};

const newRequest = (
  body: Record<string, unknown>,
  tokenResult: { worker_sid: string; roles: string[] },
): FlexValidatedHttpRequest =>
  ({
    body,
    tokenResult,
  }) as FlexValidatedHttpRequest;

describe('transferStartHandler', () => {
  let mockFetchTask: jest.Mock;
  let mockUpdateTask: jest.Mock;
  let mockListReservations: jest.Mock;
  let mockCreateTask: jest.Mock;
  let workerFetchMocks: Record<string, jest.Mock>;

  const setUpMockClient = (originalTaskAttributes: Record<string, unknown>) => {
    mockFetchTask = jest.fn().mockResolvedValue({
      sid: TASK_SID,
      attributes: JSON.stringify(originalTaskAttributes),
      taskChannelUniqueName: 'chat',
    });
    mockUpdateTask = jest.fn().mockResolvedValue({});
    mockListReservations = jest.fn().mockResolvedValue([
      {
        sid: ORIGINAL_RESERVATION_SID,
        reservationStatus: 'accepted',
        workerSid: ORIGINAL_WORKER_SID,
      },
    ]);
    mockCreateTask = jest.fn().mockResolvedValue({ sid: NEW_TASK_SID });
    workerFetchMocks = {
      [ORIGINAL_WORKER_SID]: jest.fn().mockResolvedValue({
        sid: ORIGINAL_WORKER_SID,
        available: true,
        attributes: JSON.stringify({ full_name: 'Original Counselor' }),
      }),
      [SUPERVISOR_WORKER_SID]: jest.fn().mockResolvedValue({
        sid: SUPERVISOR_WORKER_SID,
        available: true,
        attributes: JSON.stringify({ full_name: 'Supervisor' }),
      }),
    };

    const taskContext = {
      fetch: mockFetchTask,
      update: mockUpdateTask,
      reservations: {
        list: mockListReservations,
      },
    };
    // Support both tasks.get(sid) and tasks(sid) call styles used in the handler
    const tasks = Object.assign(() => taskContext, {
      get: () => taskContext,
      create: mockCreateTask,
    });

    const mockClient: RecursivePartial<twilio.Twilio> = {
      taskrouter: {
        v1: {
          workspaces: {
            get: () => ({
              tasks,
              workers: {
                get: (workerSid: string) => ({
                  fetch: workerFetchMocks[workerSid],
                  workerChannels: {
                    get: () => ({
                      fetch: jest.fn().mockResolvedValue({
                        availableCapacityPercentage: 1,
                        configuredCapacity: 1,
                      }),
                    }),
                  },
                }),
              },
            }),
          },
        },
      },
    };

    mockGetTwilioClient.mockResolvedValue(mockClient as twilio.Twilio);
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID);
    mockGetMasterWorkflowSid.mockResolvedValue('WWmaster');
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setUpMockClient(ORIGINAL_TASK_ATTRIBUTES);
  });

  test("rejects requests from workers that are neither supervisors nor assigned the task's accepted reservation", async () => {
    const result = await transferStartHandler(
      newRequest(
        { taskSid: TASK_SID, targetSid: 'WKother', mode: 'COLD' },
        { worker_sid: 'WKother', roles: ['agent'] },
      ),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect((result.error as HttpError).statusCode).toBe(403);
    }
    expect(mockUpdateTask).not.toHaveBeenCalled();
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  test('supervisor take over sets transfer meta on the original task and ignores the originally assigned worker', async () => {
    const result = await transferStartHandler(
      newRequest(
        {
          taskSid: TASK_SID,
          targetSid: SUPERVISOR_WORKER_SID,
          // simulates a client sending its own sid, which should be overridden server side
          ignoreAgent: SUPERVISOR_WORKER_SID,
          mode: 'COLD',
        },
        { worker_sid: SUPERVISOR_WORKER_SID, roles: ['supervisor'] },
      ),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toEqual({ taskSid: NEW_TASK_SID });
    }

    const expectedTransferMeta = {
      originalTask: TASK_SID,
      originalReservation: ORIGINAL_RESERVATION_SID,
      originalCounselor: ORIGINAL_WORKER_SID,
      originalCounselorName: 'Original Counselor',
      originalConversationSid: CHANNEL_SID,
      sidWithTaskControl: DUMMY_RESERVATION_SID,
      transferStatus: 'accepted',
      mode: 'COLD',
      targetType: 'worker',
    };

    // First update replicates setTransferMeta on the original task
    const firstUpdateAttributes = JSON.parse(mockUpdateTask.mock.calls[0][0].attributes);
    expect(firstUpdateAttributes).toEqual({
      ...ORIGINAL_TASK_ATTRIBUTES,
      transferStarted: true,
      transferMeta: expectedTransferMeta,
    });

    // New task carries the transfer meta and ignores the original worker, not the supervisor
    const createdAttributes = JSON.parse(mockCreateTask.mock.calls[0][0].attributes);
    expect(createdAttributes).toEqual(
      expect.objectContaining({
        transferStarted: true,
        transferMeta: expectedTransferMeta,
        ignoreAgent: ORIGINAL_WORKER_SID,
        targetSid: SUPERVISOR_WORKER_SID,
        transferTargetType: 'worker',
      }),
    );
  });

  test('assigned worker can start a transfer without a supervisor role', async () => {
    const result = await transferStartHandler(
      newRequest(
        { taskSid: TASK_SID, targetSid: SUPERVISOR_WORKER_SID, mode: 'COLD' },
        { worker_sid: ORIGINAL_WORKER_SID, roles: ['agent'] },
      ),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    expect(mockCreateTask).toHaveBeenCalled();
  });

  test('rebuilds stale transfer meta left by a previously rejected transfer', async () => {
    const staleTransferMeta = {
      originalTask: TASK_SID,
      originalReservation: 'WRstale',
      originalCounselor: ORIGINAL_WORKER_SID,
      originalCounselorName: 'Original Counselor',
      originalConversationSid: CHANNEL_SID,
      // A rejected transfer hands control back to the original reservation
      sidWithTaskControl: 'WRstale',
      transferStatus: 'rejected',
      mode: 'COLD',
      targetType: 'worker',
    };
    setUpMockClient({
      ...ORIGINAL_TASK_ATTRIBUTES,
      transferStarted: true,
      transferMeta: staleTransferMeta,
    });

    const result = await transferStartHandler(
      newRequest(
        { taskSid: TASK_SID, targetSid: SUPERVISOR_WORKER_SID, mode: 'COLD' },
        { worker_sid: ORIGINAL_WORKER_SID, roles: ['agent'] },
      ),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    // The stale meta is replaced with fresh meta derived from the accepted reservation
    const firstUpdateAttributes = JSON.parse(mockUpdateTask.mock.calls[0][0].attributes);
    expect(firstUpdateAttributes.transferMeta).toEqual({
      ...staleTransferMeta,
      originalReservation: ORIGINAL_RESERVATION_SID,
      sidWithTaskControl: DUMMY_RESERVATION_SID,
      transferStatus: 'accepted',
    });
    const createdAttributes = JSON.parse(mockCreateTask.mock.calls[0][0].attributes);
    expect(createdAttributes.transferMeta).toEqual(firstUpdateAttributes.transferMeta);
  });

  test('returns 400 if the task has no accepted reservation', async () => {
    mockListReservations.mockResolvedValue([]);

    const result = await transferStartHandler(
      newRequest(
        { taskSid: TASK_SID, targetSid: SUPERVISOR_WORKER_SID, mode: 'COLD' },
        { worker_sid: SUPERVISOR_WORKER_SID, roles: ['supervisor'] },
      ),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect((result.error as HttpError).statusCode).toBe(400);
    }
    expect(mockUpdateTask).not.toHaveBeenCalled();
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  test('rolls back transfer meta on the original task if creating the new task fails', async () => {
    mockCreateTask.mockRejectedValue(new Error('boom'));

    const result = await transferStartHandler(
      newRequest(
        { taskSid: TASK_SID, targetSid: SUPERVISOR_WORKER_SID, mode: 'COLD' },
        { worker_sid: SUPERVISOR_WORKER_SID, roles: ['supervisor'] },
      ),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect((result.error as HttpError).statusCode).toBe(500);
    }

    // Last update restores the original attributes
    const lastUpdateAttributes = JSON.parse(
      mockUpdateTask.mock.calls[mockUpdateTask.mock.calls.length - 1][0].attributes,
    );
    expect(lastUpdateAttributes).toEqual(ORIGINAL_TASK_ATTRIBUTES);
  });
});
