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

import type { Reservation } from 'twilio-taskrouter';

import {
  acceptSelfInitiatedTakeover,
  isSupervisorTakeoverOfTask,
  notifySupervisorTakeoverIfNeeded,
  SUPERVISOR_TAKEOVER_NOTIFICATION_ID,
  TAKEOVER_SUCCESS_NOTIFICATION_ID,
} from '../../transfer/takeoverReservation';

const mockInvokeAction = jest.fn().mockResolvedValue(undefined);
const mockShowNotificationSingle = jest.fn();
const mockWorkerSid = 'WK-current-worker';

jest.mock('@twilio/flex-ui', () => ({
  Actions: { invokeAction: (...args) => mockInvokeAction(...args) },
  Manager: { getInstance: () => ({ workerClient: { sid: mockWorkerSid } }) },
  Notifications: { showNotificationSingle: (...args) => mockShowNotificationSingle(...args) },
}));

const reservation = (initiatedByWorker: string) =>
  (({
    sid: 'WR-reservation',
    task: { attributes: { initiatedByWorker } },
  } as unknown) as Reservation);

describe('acceptSelfInitiatedTakeover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts a reservation initiated by the current worker and shows success', async () => {
    await acceptSelfInitiatedTakeover(reservation(mockWorkerSid));

    expect(mockInvokeAction).toHaveBeenCalledWith('AcceptTask', { sid: 'WR-reservation' });
    expect(mockInvokeAction).toHaveBeenCalledWith('SelectTask', { sid: 'WR-reservation' });
    expect(mockInvokeAction.mock.invocationCallOrder[0]).toBeLessThan(mockInvokeAction.mock.invocationCallOrder[1]);
    expect(mockShowNotificationSingle).toHaveBeenCalledWith(TAKEOVER_SUCCESS_NOTIFICATION_ID);
  });

  it('does not accept reservations initiated by another worker', async () => {
    await acceptSelfInitiatedTakeover(reservation('WK-another-worker'));

    expect(mockInvokeAction).not.toHaveBeenCalled();
    expect(mockShowNotificationSingle).not.toHaveBeenCalled();
  });

  it('does not show success if accepting the reservation fails', async () => {
    mockInvokeAction.mockRejectedValueOnce(new Error('accept failed'));

    await expect(acceptSelfInitiatedTakeover(reservation(mockWorkerSid))).rejects.toThrow('accept failed');
    expect(mockShowNotificationSingle).not.toHaveBeenCalled();
  });

  it('still reports success if selecting the accepted task fails', async () => {
    mockInvokeAction.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('select failed'));

    await expect(acceptSelfInitiatedTakeover(reservation(mockWorkerSid))).rejects.toThrow('select failed');
    expect(mockShowNotificationSingle).toHaveBeenCalledWith(TAKEOVER_SUCCESS_NOTIFICATION_ID);
  });
});

describe('isSupervisorTakeoverOfTask', () => {
  const taskSid = 'WT-original-task';
  const supervisorSid = 'WK-supervisor';
  const counselorSid = 'WK-original-counselor';

  it('matches metadata for the original counselor task', () => {
    expect(
      isSupervisorTakeoverOfTask({ initiatingWorkerSid: supervisorSid, originalTask: taskSid }, taskSid, counselorSid),
    ).toBe(true);
  });

  it('supports an originalTaskSid metadata field', () => {
    expect(
      isSupervisorTakeoverOfTask(
        { initiatingWorkerSid: supervisorSid, originalTaskSid: taskSid },
        taskSid,
        counselorSid,
      ),
    ).toBe(true);
  });

  it('does not match another task or the logged-in worker as initiator', () => {
    expect(
      isSupervisorTakeoverOfTask(
        { initiatingWorkerSid: supervisorSid, originalTask: 'WT-another-task' },
        taskSid,
        counselorSid,
      ),
    ).toBe(false);
    expect(
      isSupervisorTakeoverOfTask({ initiatingWorkerSid: counselorSid, originalTask: taskSid }, taskSid, counselorSid),
    ).toBe(false);
  });
});

describe('notifySupervisorTakeoverIfNeeded', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a single notification per task when another worker initiated its takeover', () => {
    const notifiedTaskSids = new Set<string>();
    const transferMeta = { initiatingWorkerSid: 'WK-supervisor', originalTask: 'WT-original-task' };

    notifySupervisorTakeoverIfNeeded(transferMeta, 'WT-original-task', 'WK-counselor', notifiedTaskSids);
    notifySupervisorTakeoverIfNeeded(transferMeta, 'WT-original-task', 'WK-counselor', notifiedTaskSids);

    expect(mockShowNotificationSingle).toHaveBeenCalledTimes(1);
    expect(mockShowNotificationSingle).toHaveBeenCalledWith(SUPERVISOR_TAKEOVER_NOTIFICATION_ID);
  });
});
