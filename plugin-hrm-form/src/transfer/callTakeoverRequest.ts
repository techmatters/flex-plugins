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

/**
 * Counselor side of a supervisor 'take over' of a call task.
 * Voice tasks can only be transferred by the worker assigned them, so the supervisor records a takeoverRequest
 * on the task (lambda transfer/requestCallTakeover) and the assigned counselor's Flex client starts a cold transfer to them.
 */

import { Actions, Notifications, TaskHelper } from '@twilio/flex-ui';
import type { Reservation, Worker } from 'twilio-taskrouter';

import { updateCallTakeoverStatus } from '../services/twilioTaskService';
import { TaskSID } from '../types/twilio';
import { transferModes } from '../states/DomainConstants';
import { canTransferConference } from './transferTaskState';
import { SUPERVISOR_TAKEOVER_NOTIFICATION_ID } from './takeoverReservation';

// Matches the lambda: the server rejects claims on older requests anyway, this just avoids the round trip
const CALL_TAKEOVER_REQUEST_TTL_MS = 60 * 1000;

type CallTakeoverRequest = {
  requestedBy: string;
  requestedAt: string;
  originalReservation: string;
  originalCounselor: string;
  status: 'requested' | 'started' | 'failed';
  reason?: string;
};

export const isCallTakeoverRequestForReservation = (
  reservation: Pick<Reservation, 'sid' | 'status' | 'workerSid' | 'task'>,
  now: number,
): boolean => {
  const request: CallTakeoverRequest | undefined = reservation.task.attributes?.takeoverRequest;
  return Boolean(
    request &&
      request.status === 'requested' &&
      reservation.status === 'accepted' &&
      request.originalReservation === reservation.sid &&
      request.requestedBy !== reservation.workerSid &&
      now - Date.parse(request.requestedAt) <= CALL_TAKEOVER_REQUEST_TTL_MS,
  );
};

type Dependencies = {
  getFlexTask: (reservationSid: string) => ITask | undefined;
  transferTask: (payload: unknown) => Promise<unknown>;
  updateStatus: typeof updateCallTakeoverStatus;
  notifyCounselor: () => void;
  now: () => number;
};

const defaultDependencies: Dependencies = {
  getFlexTask: reservationSid => TaskHelper.getTaskByTaskSid(reservationSid) as ITask,
  transferTask: payload => Actions.invokeAction('TransferTask', payload),
  updateStatus: updateCallTakeoverStatus,
  notifyCounselor: () => Notifications.showNotificationSingle(SUPERVISOR_TAKEOVER_NOTIFICATION_ID),
  now: () => Date.now(),
};

const hasOutgoingTransferStarted = async (reservation: Reservation) => {
  const { outgoing } = (await reservation.task.fetchLatestVersion()).transfers ?? {};
  return Boolean(outgoing && outgoing.status !== 'FAILED' && outgoing.status !== 'CANCELED');
};

export const startCallTakeoverIfRequested = async (
  reservation: Reservation,
  dependencies: Dependencies = defaultDependencies,
): Promise<void> => {
  if (!isCallTakeoverRequestForReservation(reservation, dependencies.now())) return;

  const taskSid = reservation.task.sid as TaskSID;
  const { requestedBy }: CallTakeoverRequest = reservation.task.attributes.takeoverRequest;
  const reportFailure = (reason: string) =>
    dependencies.updateStatus({ taskSid, status: 'failed', reason }).catch(error => {
      console.error(`Failed to report failed call take over for task ${taskSid}`, error);
    });

  try {
    // Only one of the counselor's Flex tabs can claim the request, so the call is only transferred once
    await dependencies.updateStatus({ taskSid, status: 'started' });
  } catch (error) {
    console.info(`Call take over for task ${taskSid} not claimed by this client`, error);
    return;
  }

  const flexTask = dependencies.getFlexTask(reservation.sid);
  // Checked here rather than left to the TransferTask action, which would show an alert to a counselor who didn't ask for the transfer
  if (!flexTask || !canTransferConference(flexTask)) {
    await reportFailure('The call cannot be transferred: it is not live, or has too many participants');
    return;
  }

  try {
    await dependencies.transferTask({
      task: flexTask,
      targetSid: requestedBy,
      options: { mode: transferModes.cold, initiatingWorkerSid: requestedBy },
    });
  } catch (error) {
    await reportFailure((error as Error)?.message ?? 'Transfer failed');
    return;
  }

  // The TransferTask action swallows transfer errors, so check TaskRouter directly
  if (!(await hasOutgoingTransferStarted(reservation))) {
    await reportFailure('The call transfer did not start');
    return;
  }
  dependencies.notifyCounselor();
};

/**
 * Watches the counselor's reservations for take over requests, including those made before this client loaded
 */
export const setUpCallTakeoverRequests = (workerClient: Worker) => {
  const watchReservation = (reservation: Reservation) => {
    const startIfRequested = () =>
      startCallTakeoverIfRequested(reservation).catch(error => {
        console.error(`Failed to start call take over for reservation ${reservation.sid}`, error);
      });
    reservation.task.on('updated', startIfRequested);
    startIfRequested();
  };
  workerClient.reservations.forEach(watchReservation);
  workerClient.on('reservationCreated', watchReservation);
};
