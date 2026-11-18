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

import {
  acceptSpecificTask,
  isWaitingForTask,
  withAvailableWorkerForTask,
} from '../../../src/task/assignSpecificTask';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
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

const TARGET_SID = 'WKtarget';

describe('isWaitingForTask', () => {
  it('returns true when waitingForSpecificTask is set', () => {
    expect(isWaitingForTask({ waitingForSpecificTask: true })).toBe(true);
  });

  it('returns true when deprecated waitingOfflineContact is set', () => {
    expect(isWaitingForTask({ waitingOfflineContact: true })).toBe(true);
  });

  it('returns false when neither attribute is set', () => {
    expect(isWaitingForTask({})).toBe(false);
  });
});

describe('acceptSpecificTask', () => {
  const createTask = (reservations: any[]) => ({
    sid: 'WTtask',
    reservations: jest.fn().mockReturnValue({
      list: jest.fn().mockResolvedValue(reservations),
    }),
  });

  it('accepts a pending reservation belonging to the target worker', async () => {
    const update = jest.fn().mockResolvedValue({ reservationStatus: 'accepted' });
    const task = createTask([
      {
        sid: 'WRother',
        workerSid: 'WKother',
        reservationStatus: 'pending',
        update: jest.fn(),
      },
      { sid: 'WRtarget', workerSid: TARGET_SID, reservationStatus: 'pending', update },
    ]);

    await acceptSpecificTask(TARGET_SID, task as any);

    expect(update).toHaveBeenCalledWith({ reservationStatus: 'accepted' });
  });

  it('invokes beforeAccept with the reservation sid before accepting', async () => {
    const update = jest.fn().mockResolvedValue({ reservationStatus: 'accepted' });
    const task = createTask([
      { sid: 'WRtarget', workerSid: TARGET_SID, reservationStatus: 'pending', update },
    ]);
    const beforeAccept = jest.fn().mockResolvedValue(undefined);

    await acceptSpecificTask(TARGET_SID, task as any, beforeAccept);

    expect(beforeAccept).toHaveBeenCalledWith('WRtarget', false);
    expect(update).toHaveBeenCalled();
  });

  it('does not call update again when the reservation is already accepted', async () => {
    const update = jest.fn();
    const task = createTask([
      { sid: 'WRtarget', workerSid: TARGET_SID, reservationStatus: 'accepted', update },
    ]);
    const beforeAccept = jest.fn().mockResolvedValue(undefined);

    await acceptSpecificTask(TARGET_SID, task as any, beforeAccept);

    expect(beforeAccept).toHaveBeenCalledWith('WRtarget', true);
    expect(update).not.toHaveBeenCalled();
  });

  it('polls for the reservation to appear, bounded to 9 attempts', async () => {
    const list = jest.fn().mockResolvedValue([]);
    const task = {
      sid: 'WTtask',
      reservations: jest.fn().mockReturnValue({ list }),
    };

    await expect(acceptSpecificTask(TARGET_SID, task as any)).rejects.toThrow(
      /no reservation found/,
    );

    expect(list).toHaveBeenCalledTimes(9);
  }, 10000);

  it('throws if the reservation update does not result in accepted status', async () => {
    const update = jest.fn().mockResolvedValue({ reservationStatus: 'rejected' });
    const task = createTask([
      { sid: 'WRtarget', workerSid: TARGET_SID, reservationStatus: 'pending', update },
    ]);

    await expect(acceptSpecificTask(TARGET_SID, task as any)).rejects.toThrow(
      /not accepted/,
    );
  });
});

describe('withAvailableWorkerForTask', () => {
  const previousAttributes = { helpline: 'test-helpline' };

  const createWorkerContext = (attributesOverride: object = {}) => {
    const attributes = { ...previousAttributes, ...attributesOverride };
    const fetch = jest.fn().mockResolvedValue({
      sid: TARGET_SID,
      activitySid: 'WA_PREVIOUS',
      attributes: JSON.stringify(attributes),
    });
    const update = jest.fn().mockResolvedValue({});
    return { fetch, update };
  };

  const setUpClient = (workerContext: ReturnType<typeof createWorkerContext>) => {
    const client = {
      taskrouter: {
        v1: {
          workspaces: jest.fn().mockReturnValue({
            workers: jest.fn().mockReturnValue(workerContext),
            activities: {
              list: jest.fn().mockResolvedValue([{ sid: 'WA_AVAILABLE' }]),
            },
          }),
        },
      },
    };
    mockGetTwilioClient.mockResolvedValue(client as any);
    return client;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID as any);
  });

  it('sets the worker available with the waiting attributes, runs assign, then restores the worker', async () => {
    const workerContext = createWorkerContext();
    setUpClient(workerContext);

    const assign = jest.fn().mockResolvedValue('assigned');
    const result = await withAvailableWorkerForTask(
      TEST_ACCOUNT_SID,
      { sid: TARGET_SID },
      { taskSid: 'WTnew', reason: 'takeover', originalTaskSid: 'WToriginal' },
      assign,
    );

    expect(result).toBe('assigned');
    expect(assign).toHaveBeenCalledTimes(1);
    expect(workerContext.update).toHaveBeenCalledTimes(2);

    const [[makeAvailableCall], [restoreCall]] = workerContext.update.mock.calls;
    expect(makeAvailableCall.activitySid).toBe('WA_AVAILABLE');
    const makeAvailableAttributes = JSON.parse(makeAvailableCall.attributes);
    expect(makeAvailableAttributes.waitingForSpecificTask).toBe(true);
    expect(makeAvailableAttributes.waitingForSpecificTaskInfo).toEqual({
      taskSid: 'WTnew',
      reason: 'takeover',
      originalTaskSid: 'WToriginal',
    });
    expect(makeAvailableAttributes.waitingOfflineContact).toBeUndefined();

    expect(restoreCall.activitySid).toBe('WA_PREVIOUS');
    expect(restoreCall.rejectPendingReservations).toBe(true);
    const restoredAttributes = JSON.parse(restoreCall.attributes);
    expect(restoredAttributes.waitingForSpecificTask).toBeUndefined();
    expect(restoredAttributes.waitingForSpecificTaskInfo).toBeUndefined();
    expect(restoredAttributes).toEqual(previousAttributes);
  });

  it('sets the deprecated waitingOfflineContact attribute only for offline-contact reason', async () => {
    const workerContext = createWorkerContext();
    setUpClient(workerContext);

    await withAvailableWorkerForTask(
      TEST_ACCOUNT_SID,
      { sid: TARGET_SID },
      { taskSid: 'WTnew', reason: 'offline-contact' },
      jest.fn().mockResolvedValue(undefined),
    );

    const [[makeAvailableCall]] = workerContext.update.mock.calls;
    const makeAvailableAttributes = JSON.parse(makeAvailableCall.attributes);
    expect(makeAvailableAttributes.waitingOfflineContact).toBe(true);
  });

  it('rejects if the worker is already waiting for a specific task', async () => {
    const workerContext = createWorkerContext({ waitingForSpecificTask: true });
    setUpClient(workerContext);

    await expect(
      withAvailableWorkerForTask(
        TEST_ACCOUNT_SID,
        { sid: TARGET_SID },
        { taskSid: 'WTnew', reason: 'takeover' },
        jest.fn(),
      ),
    ).rejects.toThrow(/already waiting/);

    expect(workerContext.update).not.toHaveBeenCalled();
  });

  it('restores the worker even if assign throws, and preserves the original error', async () => {
    const workerContext = createWorkerContext();
    setUpClient(workerContext);

    const assignError = new Error('assign failed');
    await expect(
      withAvailableWorkerForTask(
        TEST_ACCOUNT_SID,
        { sid: TARGET_SID },
        { taskSid: 'WTnew', reason: 'takeover' },
        jest.fn().mockRejectedValue(assignError),
      ),
    ).rejects.toThrow('assign failed');

    expect(workerContext.update).toHaveBeenCalledTimes(2);
    const [, [restoreCall]] = workerContext.update.mock.calls;
    expect(restoreCall.activitySid).toBe('WA_PREVIOUS');
  });

  it('preserves unrelated attribute changes made to the worker while assign() was running', async () => {
    const workerContext = createWorkerContext();
    setUpClient(workerContext);
    workerContext.fetch
      .mockResolvedValueOnce({
        sid: TARGET_SID,
        activitySid: 'WA_PREVIOUS',
        attributes: JSON.stringify(previousAttributes),
      })
      .mockResolvedValueOnce({
        sid: TARGET_SID,
        activitySid: 'WA_AVAILABLE',
        attributes: JSON.stringify({
          ...previousAttributes,
          waitingForSpecificTask: true,
          waitingForSpecificTaskInfo: { taskSid: 'WTnew', reason: 'takeover' },
          someUnrelatedAttribute: 'changed-during-assign',
        }),
      });

    await withAvailableWorkerForTask(
      TEST_ACCOUNT_SID,
      { sid: TARGET_SID },
      { taskSid: 'WTnew', reason: 'takeover' },
      jest.fn().mockResolvedValue(undefined),
    );

    const [, [restoreCall]] = workerContext.update.mock.calls;
    const restoredAttributes = JSON.parse(restoreCall.attributes);
    expect(restoredAttributes.someUnrelatedAttribute).toBe('changed-during-assign');
    expect(restoredAttributes.waitingForSpecificTask).toBeUndefined();
  });
});
