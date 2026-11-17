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

import { assignOfflineContactInitHandler } from '../../../src/task/assignOfflineContactInit';
import {
  getTwilioClient,
  getWorkspaceSid,
  getMasterWorkflowSid,
} from '@tech-matters/twilio-configuration';
import { isErr, isOk } from '@tech-matters/result-type';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import {
  TEST_ACCOUNT_SID,
  TEST_WORKER_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn(),
  getMasterWorkflowSid: jest.fn(),
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

const TEST_WORKFLOW_SID = 'WW00000000000000000000000000000000';
const TARGET_SID = TEST_WORKER_SID;
const TASK_ATTRIBUTES = JSON.stringify({ customers: { external_id: 'old_id' } });

const createMockRequest = (body: any): FlexValidatedHttpRequest => ({
  method: 'POST',
  headers: {},
  path: '/test',
  query: {},
  body,
  tokenResult: { worker_sid: TEST_WORKER_SID, roles: ['agent'] },
});

const mockWorkerAttributes = {
  helpline: 'test-helpline',
  waitingOfflineContact: false,
};

const createMockTask = (sid: string, attributes: string) => ({
  sid,
  attributes,
  update: jest.fn(),
  remove: jest.fn(),
  reservations: jest.fn().mockReturnValue({
    list: jest.fn(),
  }),
});

const createMockWorker = (available: boolean, attributes: object) => ({
  sid: TARGET_SID,
  activitySid: 'WA_OFFLINE',
  attributes: JSON.stringify(attributes),
  available,
  update: jest.fn().mockResolvedValue({}),
});

describe('assignOfflineContactInitHandler', () => {
  let mockClient: any;
  let mockWorker: any;
  let mockTask: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);
    mockGetMasterWorkflowSid.mockResolvedValue(TEST_WORKFLOW_SID);

    mockTask = createMockTask(
      'WT_NEW_TASK',
      JSON.stringify({ helpline: 'test-helpline' }),
    );
    mockWorker = createMockWorker(true, mockWorkerAttributes);

    mockClient = {
      taskrouter: {
        v1: {
          workspaces: jest.fn().mockReturnValue({
            workers: jest.fn().mockReturnValue({
              fetch: jest.fn().mockResolvedValue(mockWorker),
              update: mockWorker.update,
            }),
            tasks: {
              create: jest.fn().mockResolvedValue(mockTask),
            },
            activities: {
              list: jest.fn().mockResolvedValue([{ sid: 'WA_AVAILABLE' }]),
            },
          }),
        },
      },
    };

    mockGetTwilioClient.mockResolvedValue(mockClient as any);
  });

  it('should return 400 when targetSid is missing', async () => {
    const request = createMockRequest({ taskAttributes: TASK_ATTRIBUTES });
    const result = await assignOfflineContactInitHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('targetSid');
    }
  });

  it('should return 400 when taskAttributes is missing', async () => {
    const request = createMockRequest({ targetSid: TARGET_SID });
    const result = await assignOfflineContactInitHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(400);
      expect(result.message).toContain('taskAttributes');
    }
  });

  it('should return 500 when worker has no helpline attribute', async () => {
    mockWorker = createMockWorker(true, { waitingOfflineContact: false });
    mockClient.taskrouter.v1.workspaces.mockReturnValue({
      workers: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue(mockWorker),
      }),
      tasks: { create: jest.fn() },
    });

    const request = createMockRequest({
      targetSid: TARGET_SID,
      taskAttributes: TASK_ATTRIBUTES,
    });
    const result = await assignOfflineContactInitHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toContain('helpline');
    }
  });

  it('should return 500 when worker is already waiting for an offline contact', async () => {
    mockWorker = createMockWorker(true, {
      helpline: 'test-helpline',
      waitingOfflineContact: true,
    });
    mockClient.taskrouter.v1.workspaces.mockReturnValue({
      workers: jest.fn().mockReturnValue({
        fetch: jest.fn().mockResolvedValue(mockWorker),
      }),
      tasks: { create: jest.fn() },
    });

    const request = createMockRequest({
      targetSid: TARGET_SID,
      taskAttributes: TASK_ATTRIBUTES,
    });
    const result = await assignOfflineContactInitHandler(request, TEST_ACCOUNT_SID);

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.statusCode).toBe(500);
      expect(result.message).toContain('already waiting');
    }
  });

  it('should assign task to available worker and return success', async () => {
    const updatedTask = { ...mockTask, sid: 'WT_UPDATED' };
    mockTask.update.mockResolvedValue(updatedTask);
    mockTask.reservations.mockReturnValue({
      list: jest.fn().mockResolvedValue([
        {
          workerSid: TARGET_SID,
          reservationStatus: 'pending',
          update: jest.fn().mockResolvedValue({ reservationStatus: 'accepted' }),
        },
      ]),
    });

    const request = createMockRequest({
      targetSid: TARGET_SID,
      taskAttributes: TASK_ATTRIBUTES,
    });
    const result = await assignOfflineContactInitHandler(request, TEST_ACCOUNT_SID);

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data).toBeDefined();
    }
  });

  it('should throw when an unexpected error occurs', async () => {
    mockGetTwilioClient.mockRejectedValue(new Error('Connection error'));

    const request = createMockRequest({
      targetSid: TARGET_SID,
      taskAttributes: TASK_ATTRIBUTES,
    });

    await expect(
      assignOfflineContactInitHandler(request, TEST_ACCOUNT_SID),
    ).rejects.toThrow('Connection error');
  });

  it('rejects workers already waiting for a specific task before creating a task', async () => {
    mockWorker.attributes = JSON.stringify({
      helpline: 'test',
      waitingForSpecificTask: true,
    });
    const result = await assignOfflineContactInitHandler(
      createMockRequest({ targetSid: TARGET_SID, taskAttributes: TASK_ATTRIBUTES }),
      TEST_ACCOUNT_SID,
    );
    expect(isErr(result)).toBe(true);
    expect(mockClient.taskrouter.v1.workspaces().tasks.create).not.toHaveBeenCalled();
  });

  describe('offline workers', () => {
    let accept: jest.Mock;
    let listReservations: jest.Mock;
    beforeEach(() => {
      mockWorker.available = false;
      mockWorker.update.mockImplementation(async (update: { attributes: string }) => {
        mockWorker.attributes = update.attributes;
      });
      mockTask.update.mockResolvedValue(mockTask);
      accept = jest.fn().mockImplementation(async () => {
        mockWorker.attributes = JSON.stringify({
          ...JSON.parse(mockWorker.attributes),
          changedDuringAssignment: 'retained',
        });
        return { reservationStatus: 'accepted' };
      });
      listReservations = jest
        .fn()
        .mockResolvedValue([
          { workerSid: TARGET_SID, reservationStatus: 'pending', update: accept },
        ]);
      mockTask.reservations.mockReturnValue({ list: listReservations });
    });

    const assign = () =>
      assignOfflineContactInitHandler(
        createMockRequest({ targetSid: TARGET_SID, taskAttributes: TASK_ATTRIBUTES }),
        TEST_ACCOUNT_SID,
      );

    it('sets legacy and specific-task flags after creating the task, then restores', async () => {
      expect(isOk(await assign())).toBe(true);
      expect(JSON.parse(mockTask.update.mock.calls[0][0].attributes)).toMatchObject({
        waitingForSpecificTaskSid: 'WT_NEW_TASK',
        targetSid: TARGET_SID,
      });
      expect(mockWorker.update.mock.calls[0][0]).toEqual({
        activitySid: 'WA_AVAILABLE',
        attributes: JSON.stringify({
          ...mockWorkerAttributes,
          waitingOfflineContact: true,
          waitingForSpecificTask: true,
          waitingForSpecificTaskInfo: {
            taskSid: 'WT_NEW_TASK',
            reason: 'offline-contact',
          },
        }),
      });
      expect(mockTask.update.mock.invocationCallOrder[0]).toBeLessThan(
        mockWorker.update.mock.invocationCallOrder[0],
      );
      expect(mockWorker.update).toHaveBeenLastCalledWith({
        activitySid: 'WA_OFFLINE',
        attributes: JSON.stringify({
          ...mockWorkerAttributes,
          changedDuringAssignment: 'retained',
        }),
        rejectPendingReservations: true,
      });
    });

    it('restores activity and removes only temporary flags on acceptance failure', async () => {
      accept.mockRejectedValue(new Error('accept failed'));
      const result = await assign();
      expect(isErr(result) && result.message).toBe('accept failed');
      expect(mockWorker.update).toHaveBeenCalledTimes(2);
      expect(mockWorker.update).toHaveBeenLastCalledWith(
        expect.objectContaining({
          activitySid: 'WA_OFFLINE',
          attributes: JSON.stringify(mockWorkerAttributes),
        }),
      );
      expect(mockTask.remove).toHaveBeenCalledTimes(1);
    });

    it('restores activity and removes the task after bounded reservation timeout', async () => {
      listReservations.mockResolvedValue([]);
      const result = await assign();
      expect(isErr(result) && result.message).toContain(
        'reservation for task not created',
      );
      expect(listReservations).toHaveBeenCalledTimes(9);
      expect(mockWorker.update).toHaveBeenCalledTimes(2);
      expect(mockTask.remove).toHaveBeenCalledTimes(1);
    });

    it('restores after activation errors and removes the unassigned task', async () => {
      mockWorker.update.mockRejectedValueOnce(new Error('activation failed'));
      const result = await assign();
      expect(isErr(result) && result.message).toBe('activation failed');
      expect(mockWorker.update).toHaveBeenCalledTimes(2);
      expect(accept).not.toHaveBeenCalled();
      expect(mockTask.remove).toHaveBeenCalledTimes(1);
    });

    it('does not remove an accepted task if restoring the worker fails', async () => {
      mockWorker.update
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('restore failed'));
      await expect(assign()).rejects.toThrow('restore failed');
      expect(accept).toHaveBeenCalled();
      expect(mockTask.remove).not.toHaveBeenCalled();
    });
  });
});
