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
import { isErr, isOk } from '@tech-matters/result-type';
import { transferStartHandler } from '../../../src/transfer/transferStart';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import { adjustChatCapacity } from '../../../src/conversation/adjustChatCapacity';
import { hasTaskControl } from '../../../src/transfer/hasTaskControl';
import {
  TEST_ACCOUNT_SID,
  TEST_WORKER_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn(),
  getConversationsTransferWorkflow: jest.fn().mockResolvedValue('WW_TRANSFER'),
  getMasterWorkflowSid: jest.fn().mockResolvedValue('WW_MASTER'),
}));
jest.mock('../../../src/conversation/adjustChatCapacity', () => ({
  adjustChatCapacity: jest.fn(),
}));

describe('transferStart', () => {
  let request: FlexValidatedHttpRequest;
  let worker: any;
  let workerContext: any;
  let channel: any;
  let originalTask: any;
  let newTask: any;
  let tasks: any;
  let invite: jest.Mock;
  let accept: jest.Mock;
  let reservations: jest.Mock;
  let participants: jest.Mock;
  let queueList: jest.Mock;
  let workerAttributes: Record<string, unknown>;

  beforeEach(() => {
    jest.clearAllMocks();
    request = {
      method: 'POST',
      headers: {},
      query: {},
      path: '/transfer/transferStart',
      body: {
        taskSid: 'WT_ORIGINAL',
        targetSid: TEST_WORKER_SID,
        ignoreAgent: 'WK_AGENT',
        mode: 'COLD',
        isTakeover: true,
      },
      tokenResult: { worker_sid: TEST_WORKER_SID, roles: ['supervisor'] },
    };
    workerAttributes = { helpline: 'test' };
    worker = { sid: TEST_WORKER_SID, available: false, activitySid: 'WA_OFFLINE' };
    channel = { availableCapacityPercentage: 100, configuredCapacity: 1 };
    workerContext = {
      fetch: jest.fn().mockImplementation(async () => ({
        ...worker,
        attributes: JSON.stringify(workerAttributes),
      })),
      update: jest.fn().mockImplementation(async update => {
        workerAttributes = JSON.parse(update.attributes);
      }),
      workerChannels: {
        get: jest.fn().mockReturnValue({ fetch: jest.fn().mockResolvedValue(channel) }),
      },
    };
    originalTask = {
      sid: 'WT_ORIGINAL',
      taskChannelUniqueName: 'chat',
      attributes: JSON.stringify({
        channelType: 'web',
        flexInteractionSid: 'KD_INTERACTION',
        flexInteractionChannelSid: 'UO_CHANNEL',
      }),
      update: jest.fn(),
      reservations: jest.fn().mockReturnValue({
        list: jest.fn().mockResolvedValue([
          {
            sid: 'WR_ORIGINAL',
            workerSid: 'WK_AGENT',
            workerName: 'Original Counselor',
            reservationStatus: 'accepted',
          },
        ]),
      }),
    };
    originalTask.update.mockImplementation(async (update: { attributes: string }) => {
      if (update.attributes) originalTask.attributes = update.attributes;
      return originalTask;
    });
    accept = jest.fn().mockResolvedValue({ reservationStatus: 'accepted' });
    reservations = jest.fn().mockResolvedValue([
      {
        sid: 'WR_INVITE',
        workerSid: TEST_WORKER_SID,
        reservationStatus: 'pending',
        update: accept,
      },
    ]);
    let taskAttributes = {};
    newTask = {
      reservations: { list: reservations },
      remove: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockImplementation(async update => {
        taskAttributes = JSON.parse(update.attributes);
      }),
      fetch: jest
        .fn()
        .mockImplementation(async () => ({ attributes: JSON.stringify(taskAttributes) })),
    };
    tasks = Object.assign(
      jest.fn().mockImplementation(sid =>
        sid === 'WT_ORIGINAL'
          ? {
              fetch: jest.fn().mockResolvedValue(originalTask),
              update: originalTask.update,
              reservations: originalTask.reservations(),
            }
          : newTask,
      ),
      {
        get: jest.fn().mockImplementation((sid: string) => tasks(sid)),
        create: jest.fn().mockResolvedValue({ sid: 'WT_NEW' }),
      },
    );
    const workers = Object.assign(jest.fn().mockReturnValue(workerContext), {
      get: jest.fn().mockReturnValue(workerContext),
    });
    queueList = jest
      .fn()
      .mockResolvedValue([{ sid: 'WQ_EVERYONE', friendlyName: 'Everyone' }]);
    const workspace = {
      workers,
      tasks,
      activities: { list: jest.fn().mockResolvedValue([{ sid: 'WA_AVAILABLE' }]) },
      taskQueues: { list: queueList },
    };
    const workspaces = Object.assign(jest.fn().mockReturnValue(workspace), {
      get: jest.fn().mockReturnValue(workspace),
    });
    invite = jest.fn().mockImplementation(async options => {
      taskAttributes = {
        ...options.routing.properties.attributes,
        generatedByTwilio: 'preserve',
      };
      return { routing: { properties: { sid: 'WT_INVITE' } } };
    });
    participants = jest.fn().mockResolvedValue([{ type: 'agent', sid: 'UT_AGENT' }]);
    (getTwilioClient as jest.Mock).mockResolvedValue({
      httpClient: {},
      taskrouter: { v1: { workspaces } },
      flexApi: {
        v1: {
          interaction: {
            get: jest.fn().mockReturnValue({
              channels: {
                get: jest.fn().mockReturnValue({
                  invites: { create: invite },
                  participants: { list: participants },
                }),
              },
            }),
          },
        },
      },
    });
    (getWorkspaceSid as jest.Mock).mockResolvedValue(TEST_WORKSPACE_SID);
  });

  it.each([true, false])(
    'accepts a supervisor takeover (worker online: %s)',
    async available => {
      worker.available = available;
      const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
      expect(isOk(result) && result.data).toEqual({ taskSid: 'WT_INVITE' });
      expect(invite).toHaveBeenCalledWith({
        routing: {
          properties: expect.objectContaining({
            worker_sid: TEST_WORKER_SID,
            queue_sid: 'WQ_EVERYONE',
          }),
        },
      });
      expect(tasks).toHaveBeenCalledWith('WT_INVITE');
      expect(accept).toHaveBeenCalledWith({ reservationStatus: 'accepted' });
      expect(JSON.parse(newTask.update.mock.calls[0][0].attributes)).toMatchObject({
        generatedByTwilio: 'preserve',
        waitingForSpecificTaskSid: 'WT_INVITE',
        transferStarted: true,
        transferMeta: {
          mode: 'COLD',
          transferStatus: 'accepted',
          originalTask: 'WT_ORIGINAL',
          originalReservation: 'WR_ORIGINAL',
          originalCounselor: 'WK_AGENT',
        },
      });
      expect(JSON.parse(newTask.update.mock.calls[1][0].attributes)).toMatchObject({
        generatedByTwilio: 'preserve',
        transferMeta: { sidWithTaskControl: 'WR_INVITE' },
      });
      expect(JSON.parse(originalTask.attributes)).toMatchObject({
        transferStarted: true,
        transferMeta: {
          originalTask: 'WT_ORIGINAL',
          sidWithTaskControl: 'WR00000000000000000000000000000000',
          transferStatus: 'accepted',
        },
      });
      expect(originalTask.update.mock.invocationCallOrder[0]).toBeLessThan(
        accept.mock.invocationCallOrder[0],
      );
      const client = await getTwilioClient(TEST_ACCOUNT_SID);
      expect(
        await hasTaskControl({
          client,
          workspaceSid: TEST_WORKSPACE_SID,
          taskSid: 'WT_ORIGINAL',
        }),
      ).toBe(false);
      expect(
        await hasTaskControl({
          client,
          workspaceSid: TEST_WORKSPACE_SID,
          taskSid: 'WT_INVITE',
        }),
      ).toBe(true);
      if (available) {
        expect(workerContext.update).not.toHaveBeenCalled();
      } else {
        expect(invite.mock.invocationCallOrder[0]).toBeLessThan(
          workerContext.update.mock.invocationCallOrder[0],
        );
        expect(workerContext.update.mock.calls[0][0]).toEqual({
          activitySid: 'WA_AVAILABLE',
          attributes: JSON.stringify({
            helpline: 'test',
            waitingForSpecificTask: true,
            waitingForSpecificTaskInfo: {
              taskSid: 'WT_INVITE',
              reason: 'takeover',
              originalTaskSid: 'WT_ORIGINAL',
            },
          }),
        });
        expect(workerContext.update.mock.calls[1][0]).toMatchObject({
          activitySid: 'WA_OFFLINE',
          rejectPendingReservations: true,
        });
        expect(workerAttributes).toEqual({ helpline: 'test' });
      }
    },
  );

  it.each([undefined, false])(
    'never autoaccepts regular transfers (isTakeover: %s)',
    async isTakeover => {
      worker.available = true;
      request.body.isTakeover = isTakeover;
      request.tokenResult.roles = ['agent'];
      expect(isOk(await transferStartHandler(request, TEST_ACCOUNT_SID))).toBe(true);
      expect(invite).toHaveBeenCalled();
      expect(reservations).not.toHaveBeenCalled();
      expect(workerContext.update).not.toHaveBeenCalled();
    },
  );

  it('still rejects offline regular transfers', async () => {
    request.body.isTakeover = false;
    const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
    expect(isErr(result) && result.error.statusCode).toBe(400);
    expect(invite).not.toHaveBeenCalled();
  });

  it.each(['agent', 'guest'])(
    'rejects %s takeover tokens before accessing Twilio',
    async role => {
      request.tokenResult.roles = [role];
      const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
      expect(isErr(result) && result.error.statusCode).toBe(403);
      expect(getTwilioClient).not.toHaveBeenCalled();
    },
  );

  it.each(['WK_OTHER', 'WQ_QUEUE'])('rejects takeover target %s', async targetSid => {
    request.body.targetSid = targetSid;
    const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
    expect(isErr(result) && result.error.statusCode).toBe(403);
    expect(getTwilioClient).not.toHaveBeenCalled();
  });

  it('requires a validated token for takeover', async () => {
    delete (request as Partial<FlexValidatedHttpRequest>).tokenResult;
    const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
    expect(isErr(result) && result.error.statusCode).toBe(403);
    expect(getTwilioClient).not.toHaveBeenCalled();
  });

  it.each([{ mode: 'INVALID' }, { isTakeover: 'true' }])(
    'rejects invalid input %p',
    async invalid => {
      Object.assign(request.body, invalid);
      const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
      expect(isErr(result) && result.error.statusCode).toBe(400);
      expect(getTwilioClient).not.toHaveBeenCalled();
    },
  );

  it('rejects WARM takeovers', async () => {
    request.body.mode = 'WARM';
    const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
    expect(isErr(result) && result.error.statusCode).toBe(400);
    expect(getTwilioClient).not.toHaveBeenCalled();
  });

  it('requires ignoreAgent to be the original accepted reservation owner', async () => {
    request.body.ignoreAgent = TEST_WORKER_SID;
    const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
    expect(isErr(result) && result.error.statusCode).toBe(400);
    expect(invite).not.toHaveBeenCalled();
    expect(workerContext.update).not.toHaveBeenCalled();
  });

  it('requires an accepted original reservation', async () => {
    originalTask.reservations().list.mockResolvedValue([]);
    const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
    expect(isErr(result) && result.error.statusCode).toBe(400);
    expect(invite).not.toHaveBeenCalled();
  });

  it.each(['missing interaction', 'unreadable interaction'])(
    'rejects unsupported Conversations: %s without side effects',
    async scenario => {
      if (scenario === 'missing interaction')
        originalTask.attributes = JSON.stringify({ channelType: 'web' });
      else participants.mockRejectedValue(new Error('Not found'));
      const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
      expect(isErr(result) && result.error.statusCode).toBe(400);
      expect(invite).not.toHaveBeenCalled();
      expect(tasks.create).not.toHaveBeenCalled();
      expect(originalTask.update).not.toHaveBeenCalled();
      expect(workerContext.update).not.toHaveBeenCalled();
    },
  );

  it.each(['waitingForSpecificTask', 'waitingOfflineContact'])(
    'rejects worker already %s',
    async flag => {
      workerAttributes[flag] = true;
      const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
      expect(isErr(result) && result.error.statusCode).toBe(400);
      expect(invite).not.toHaveBeenCalled();
    },
  );

  it('preserves capacity validation for takeovers', async () => {
    channel.availableCapacityPercentage = 0;
    const result = await transferStartHandler(request, TEST_ACCOUNT_SID);
    expect(isErr(result) && result.error.statusCode).toBe(400);
    expect(invite).not.toHaveBeenCalled();
  });

  it('increases expandable chat capacity after marking the invite and before activation', async () => {
    workerAttributes.maxMessageCapacity = 3;
    channel.availableCapacityPercentage = 0;
    expect(isOk(await transferStartHandler(request, TEST_ACCOUNT_SID))).toBe(true);
    expect(adjustChatCapacity).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'increaseUntilCapacityAvailable',
    });
    const capacityOrder = (adjustChatCapacity as jest.Mock).mock.invocationCallOrder[0];
    expect(newTask.update.mock.invocationCallOrder[0]).toBeLessThan(capacityOrder);
    expect(capacityOrder).toBeLessThan(workerContext.update.mock.invocationCallOrder[0]);
    expect(accept).toHaveBeenCalled();
  });

  it('restores offline supervisor and removes invite task when accepting fails', async () => {
    accept.mockImplementation(async () => {
      workerAttributes.newAttribute = true;
      throw new Error('accept failed');
    });
    await expect(transferStartHandler(request, TEST_ACCOUNT_SID)).rejects.toThrow(
      'accept failed',
    );
    expect(workerAttributes).toEqual({ helpline: 'test', newAttribute: true });
    expect(workerContext.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ activitySid: 'WA_OFFLINE' }),
    );
    expect(newTask.remove).toHaveBeenCalled();
  });

  it('never activates the worker when invite creation fails', async () => {
    const previousAttributes = originalTask.attributes;
    invite.mockRejectedValue(new Error('invite failed'));
    await expect(transferStartHandler(request, TEST_ACCOUNT_SID)).rejects.toThrow(
      'invite failed',
    );
    expect(workerContext.update).not.toHaveBeenCalled();
    expect(JSON.parse(originalTask.attributes)).toEqual(JSON.parse(previousAttributes));
  });

  it('rolls back only original transfer metadata on failure, preserving concurrent attributes', async () => {
    const previousMeta = {
      mode: 'COLD',
      transferStatus: 'accepted',
      sidWithTaskControl: 'WR_PREVIOUS',
    };
    originalTask.attributes = JSON.stringify({
      ...JSON.parse(originalTask.attributes),
      transferMeta: previousMeta,
      transferStarted: false,
    });
    accept.mockImplementation(async () => {
      originalTask.attributes = JSON.stringify({
        ...JSON.parse(originalTask.attributes),
        changedDuringAssignment: true,
      });
      throw new Error('accept failed');
    });
    await expect(transferStartHandler(request, TEST_ACCOUNT_SID)).rejects.toThrow(
      'accept failed',
    );
    expect(JSON.parse(originalTask.attributes)).toMatchObject({
      transferMeta: previousMeta,
      transferStarted: false,
      changedDuringAssignment: true,
    });
    expect(newTask.remove).toHaveBeenCalled();
    expect(
      JSON.parse(newTask.update.mock.calls[2][0].attributes).transferMeta.transferStatus,
    ).toBe('rejected');
  });

  it('does not delete an accepted takeover task if restoring the activity fails', async () => {
    workerContext.update
      .mockImplementationOnce(async (update: { attributes: string }) => {
        workerAttributes = JSON.parse(update.attributes);
      })
      .mockRejectedValueOnce(new Error('restore failed'));
    await expect(transferStartHandler(request, TEST_ACCOUNT_SID)).rejects.toThrow(
      'restore failed',
    );
    expect(accept).toHaveBeenCalled();
    expect(newTask.remove).not.toHaveBeenCalled();
  });

  it('does not delete an already accepted takeover if updating task control fails', async () => {
    reservations.mockResolvedValue([
      {
        sid: 'WR_INVITE',
        workerSid: TEST_WORKER_SID,
        reservationStatus: 'accepted',
        update: accept,
      },
    ]);
    newTask.update
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('control update failed'));
    await expect(transferStartHandler(request, TEST_ACCOUNT_SID)).rejects.toThrow(
      'control update failed',
    );
    expect(accept).not.toHaveBeenCalled();
    expect(newTask.remove).not.toHaveBeenCalled();
  });

  it('cleans up an invite whose task attributes cannot be updated before activation', async () => {
    newTask.update.mockRejectedValue(new Error('update failed'));
    await expect(transferStartHandler(request, TEST_ACCOUNT_SID)).rejects.toThrow(
      'update failed',
    );
    expect(workerContext.update).not.toHaveBeenCalled();
    expect(newTask.remove).toHaveBeenCalled();
  });

  it('restores activity after bounded reservation timeout and removes the invite task', async () => {
    reservations.mockResolvedValue([]);
    await expect(transferStartHandler(request, TEST_ACCOUNT_SID)).rejects.toThrow(
      'reservation for task not created',
    );
    expect(reservations).toHaveBeenCalledTimes(9);
    expect(workerAttributes).toEqual({ helpline: 'test' });
    expect(workerContext.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ activitySid: 'WA_OFFLINE' }),
    );
    expect(newTask.remove).toHaveBeenCalled();
  });

  it('preserves regular programmable chat transfers and capacity adjustment', async () => {
    request.body.isTakeover = false;
    request.body.mode = 'COLD';
    worker.available = true;
    workerAttributes.maxMessageCapacity = 3;
    channel.availableCapacityPercentage = 0;
    originalTask.attributes = JSON.stringify({ channelType: 'web' });
    expect(isOk(await transferStartHandler(request, TEST_ACCOUNT_SID))).toBe(true);
    expect(tasks.create).toHaveBeenCalled();
    expect(invite).not.toHaveBeenCalled();
    expect(accept).not.toHaveBeenCalled();
    expect(adjustChatCapacity).toHaveBeenCalledWith(TEST_ACCOUNT_SID, {
      workerSid: TEST_WORKER_SID,
      adjustment: 'increaseUntilCapacityAvailable',
    });
  });
});
