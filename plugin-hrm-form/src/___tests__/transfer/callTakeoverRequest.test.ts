/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { EventEmitter } from 'events';

import type { Reservation, Worker } from 'twilio-taskrouter';

import {
  isCallTakeoverRequestForReservation,
  setUpCallTakeoverRequests,
  startCallTakeoverIfRequested,
} from '../../transfer/callTakeoverRequest';
import { canTransferConference } from '../../transfer/transferTaskState';

jest.mock('@twilio/flex-ui', () => ({}));
jest.mock('../../services/twilioTaskService', () => ({ updateCallTakeoverStatus: jest.fn() }));
jest.mock('../../transfer/transferTaskState', () => ({ canTransferConference: jest.fn() }));

const mockCanTransferConference = canTransferConference as jest.MockedFunction<typeof canTransferConference>;

const NOW = Date.parse('2026-11-17T10:00:00.000Z');
const COUNSELOR_SID = 'WKcounselor';
const SUPERVISOR_SID = 'WKsupervisor';
const RESERVATION_SID = 'WRoriginal';
const TASK_SID = 'WTcall';
const flexTask = ({ sid: RESERVATION_SID } as unknown) as ITask;

const newRequest = (overrides: Record<string, unknown> = {}) => ({
  requestedBy: SUPERVISOR_SID,
  requestedAt: new Date(NOW).toISOString(),
  originalReservation: RESERVATION_SID,
  originalCounselor: COUNSELOR_SID,
  status: 'requested',
  ...overrides,
});

const newReservation = (
  takeoverRequest: Record<string, unknown> | null = newRequest(),
  outgoingTransfer: { status: string } | null = { status: 'INITIATED' },
) => {
  const task = Object.assign(new EventEmitter(), {
    sid: TASK_SID,
    attributes: { takeoverRequest },
    fetchLatestVersion: jest.fn(async () => ({ transfers: { outgoing: outgoingTransfer } })),
  });
  return ({ sid: RESERVATION_SID, status: 'accepted', workerSid: COUNSELOR_SID, task } as unknown) as Reservation;
};

const newDependencies = () => ({
  getFlexTask: jest.fn(() => flexTask),
  transferTask: jest.fn(async () => undefined),
  updateStatus: jest.fn(async () => undefined),
  notifyCounselor: jest.fn(),
  now: () => NOW,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockCanTransferConference.mockReturnValue(true);
});

describe('isCallTakeoverRequestForReservation', () => {
  test('pending request for the accepted reservation - true', () => {
    expect(isCallTakeoverRequestForReservation(newReservation(), NOW)).toBe(true);
  });

  test.each([
    ['no request', null],
    ['request already started', newRequest({ status: 'started' })],
    ['request failed', newRequest({ status: 'failed' })],
    ['request for another reservation', newRequest({ originalReservation: 'WRother' })],
    ['request made by this worker', newRequest({ requestedBy: COUNSELOR_SID })],
    ['expired request', newRequest({ requestedAt: new Date(NOW - 60 * 1000 - 1).toISOString() })],
  ])('%s - false', (_, request) => {
    expect(isCallTakeoverRequestForReservation(newReservation(request), NOW)).toBe(false);
  });

  test('reservation not accepted (e.g. the supervisor reservation, same task) - false', () => {
    const reservation = { ...newReservation(), status: 'pending' } as Reservation;
    expect(isCallTakeoverRequestForReservation(reservation, NOW)).toBe(false);
  });
});

describe('startCallTakeoverIfRequested', () => {
  test('claims the request, cold transfers the call to the supervisor and notifies the counselor', async () => {
    const dependencies = newDependencies();
    await startCallTakeoverIfRequested(newReservation(), dependencies);

    expect(dependencies.updateStatus).toHaveBeenCalledTimes(1);
    expect(dependencies.updateStatus).toHaveBeenCalledWith({ taskSid: TASK_SID, status: 'started' });
    expect(dependencies.transferTask).toHaveBeenCalledWith({
      task: flexTask,
      targetSid: SUPERVISOR_SID,
      options: { mode: 'COLD', initiatingWorkerSid: SUPERVISOR_SID },
    });
    expect(dependencies.notifyCounselor).toHaveBeenCalled();
  });

  test('no pending request - does nothing', async () => {
    const dependencies = newDependencies();
    await startCallTakeoverIfRequested(newReservation(null), dependencies);

    expect(dependencies.updateStatus).not.toHaveBeenCalled();
    expect(dependencies.transferTask).not.toHaveBeenCalled();
  });

  test('claimed by another tab - does not transfer or report a failure', async () => {
    const dependencies = newDependencies();
    dependencies.updateStatus.mockRejectedValueOnce(new Error('409'));
    await startCallTakeoverIfRequested(newReservation(), dependencies);

    expect(dependencies.updateStatus).toHaveBeenCalledTimes(1);
    expect(dependencies.transferTask).not.toHaveBeenCalled();
  });

  test('call cannot be transferred - reports failure without trying (no alert to the counselor)', async () => {
    mockCanTransferConference.mockReturnValue(false);
    const dependencies = newDependencies();
    await startCallTakeoverIfRequested(newReservation(), dependencies);

    expect(dependencies.transferTask).not.toHaveBeenCalled();
    expect(dependencies.updateStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({ taskSid: TASK_SID, status: 'failed' }),
    );
  });

  test('transfer action rejects - reports failure with the reason', async () => {
    const dependencies = newDependencies();
    dependencies.transferTask.mockRejectedValueOnce(new Error('boom'));
    await startCallTakeoverIfRequested(newReservation(), dependencies);

    expect(dependencies.updateStatus).toHaveBeenLastCalledWith({ taskSid: TASK_SID, status: 'failed', reason: 'boom' });
    expect(dependencies.notifyCounselor).not.toHaveBeenCalled();
  });

  test.each([null, { status: 'FAILED' }])(
    'no outgoing transfer started on TaskRouter (%p) - reports failure',
    async outgoing => {
      const dependencies = newDependencies();
      await startCallTakeoverIfRequested(newReservation(newRequest(), outgoing), dependencies);

      expect(dependencies.updateStatus).toHaveBeenLastCalledWith(
        expect.objectContaining({ taskSid: TASK_SID, status: 'failed' }),
      );
      expect(dependencies.notifyCounselor).not.toHaveBeenCalled();
    },
  );
});

describe('setUpCallTakeoverRequests', () => {
  test('watches existing and new reservations for task updates', () => {
    const existing = newReservation(null);
    const worker = Object.assign(new EventEmitter(), { reservations: new Map([[existing.sid, existing]]) });
    setUpCallTakeoverRequests((worker as unknown) as Worker);

    const created = newReservation(null);
    worker.emit('reservationCreated', created);

    expect((existing.task as any).listenerCount('updated')).toBe(1);
    expect((created.task as any).listenerCount('updated')).toBe(1);
  });
});
