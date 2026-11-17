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
  getConversationsTransferWorkflow,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { TEST_ACCOUNT_SID, TEST_WORKSPACE_SID } from '../../testTwilioValues';
import { HttpError } from '../../../src/httpTypes';
import { patchTaskAttributes } from '../../../src/task/patchTaskAttributes';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn(),
  getConversationsTransferWorkflow: jest.fn(),
}));

jest.mock('../../../src/task/patchTaskAttributes', () => ({
  patchTaskAttributes: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetWorkspaceSid = getWorkspaceSid as jest.MockedFunction<
  typeof getWorkspaceSid
>;
const mockPatchTaskAttributes = patchTaskAttributes as jest.MockedFunction<
  typeof patchTaskAttributes
>;
const mockGetConversationsTransferWorkflow =
  getConversationsTransferWorkflow as jest.MockedFunction<
    typeof getConversationsTransferWorkflow
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
  conversations: { conversation_id: 'CHoriginal' },
  flexInteractionSid: 'KDinteraction',
  flexInteractionChannelSid: 'UOchannel',
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
  let mockCreateInvite: jest.Mock;
  let workerFetchMocks: Record<string, jest.Mock>;
  let currentTaskAttributes: Record<string, unknown>;

  const setUpMockClient = (originalTaskAttributes: Record<string, unknown>) => {
    currentTaskAttributes = originalTaskAttributes;
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
    mockCreateInvite = jest.fn().mockResolvedValue({
      routing: { properties: { sid: NEW_TASK_SID } },
    });
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
    const tasks = {
      get: () => taskContext,
    };

    const mockClient: RecursivePartial<twilio.Twilio> = {
      taskrouter: {
        v1: {
          workspaces: {
            get: () => ({
              tasks,
              taskQueues: {
                list: jest
                  .fn()
                  .mockResolvedValue([{ sid: 'WQdirect', friendlyName: 'Everyone' }]),
              },
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
      flexApi: {
        v1: {
          interaction: {
            get: () => ({
              channels: {
                get: () => ({
                  participants: {
                    list: jest
                      .fn()
                      .mockResolvedValue([
                        { type: 'agent', sid: 'UOoriginalParticipant' },
                      ]),
                  },
                  invites: {
                    create: mockCreateInvite,
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
    mockGetConversationsTransferWorkflow.mockResolvedValue('WWconversations');
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPatchTaskAttributes.mockImplementation(async (_accountSid, _taskSid, update) => {
      const updatedAttributes = update(currentTaskAttributes);
      currentTaskAttributes = updatedAttributes;
      await mockUpdateTask({ attributes: JSON.stringify(updatedAttributes) });
      return { type: 'ok', data: undefined } as any;
    });
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
    expect(mockCreateInvite).not.toHaveBeenCalled();
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
      initiatingWorkerSid: SUPERVISOR_WORKER_SID,
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
    const createdInvite = mockCreateInvite.mock.calls[0][0];
    const createdAttributes = createdInvite.routing.properties.attributes;
    expect(createdAttributes).toEqual(
      expect.objectContaining({
        transferStarted: true,
        transferMeta: expectedTransferMeta,
        ignoreAgent: ORIGINAL_WORKER_SID,
        targetSid: SUPERVISOR_WORKER_SID,
        transferTargetType: 'worker',
        originalParticipantSid: 'UOoriginalParticipant',
      }),
    );
    expect(createdInvite.routing.properties).toEqual(
      expect.objectContaining({
        queue_sid: 'WQdirect',
        worker_sid: SUPERVISOR_WORKER_SID,
        workflow_sid: 'WWconversations',
        workspace_sid: TEST_WORKSPACE_SID,
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
    expect(mockCreateInvite).toHaveBeenCalled();
    expect(
      mockCreateInvite.mock.calls[0][0].routing.properties.attributes.transferMeta
        .initiatingWorkerSid,
    ).toBe(ORIGINAL_WORKER_SID);
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
      initiatingWorkerSid: ORIGINAL_WORKER_SID,
      originalReservation: ORIGINAL_RESERVATION_SID,
      sidWithTaskControl: DUMMY_RESERVATION_SID,
      transferStatus: 'accepted',
    });
    const createdAttributes =
      mockCreateInvite.mock.calls[0][0].routing.properties.attributes;
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
    expect(mockCreateInvite).not.toHaveBeenCalled();
  });

  test('rejects a transfer when another attempt is already active', async () => {
    mockPatchTaskAttributes.mockImplementation(async (_accountSid, _taskSid, update) => {
      update({
        ...currentTaskAttributes,
        transferStarted: true,
        transferMeta: { originalTask: TASK_SID, transferStatus: 'accepted' },
      });
      return { type: 'ok', data: undefined } as any;
    });

    const result = await transferStartHandler(
      newRequest(
        { taskSid: TASK_SID, targetSid: SUPERVISOR_WORKER_SID, mode: 'COLD' },
        { worker_sid: SUPERVISOR_WORKER_SID, roles: ['supervisor'] },
      ),
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect((result.error as HttpError).statusCode).toBe(409);
    }
    expect(mockPatchTaskAttributes).toHaveBeenCalledWith(
      TEST_ACCOUNT_SID,
      TASK_SID,
      expect.any(Function),
      { requireEtag: true },
    );
    expect(mockUpdateTask).not.toHaveBeenCalled();
    expect(mockCreateInvite).not.toHaveBeenCalled();
  });

  test('allows a received task to be transferred again', async () => {
    setUpMockClient({
      ...ORIGINAL_TASK_ATTRIBUTES,
      transferStarted: true,
      transferMeta: { originalTask: 'WTprevious', transferStatus: 'accepted' },
    });

    const result = await transferStartHandler(
      newRequest(
        { taskSid: TASK_SID, targetSid: SUPERVISOR_WORKER_SID, mode: 'COLD' },
        { worker_sid: ORIGINAL_WORKER_SID, roles: ['agent'] },
      ),
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result)).toBe(true);
    expect(mockCreateInvite).toHaveBeenCalled();
  });

  test('rejects tasks without Conversations identifiers before changing their attributes', async () => {
    setUpMockClient({ channelSid: CHANNEL_SID, channelType: 'web' });

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
    expect(mockCreateInvite).not.toHaveBeenCalled();
  });

  test('rolls back transfer meta on the original task if creating the invite fails', async () => {
    mockCreateInvite.mockRejectedValue(new Error('boom'));

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
