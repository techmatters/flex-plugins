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
 * Supervisor 'take over' of call tasks.
 *
 * Voice tasks can only be transferred with the TaskRouter SDK, using the token of the worker assigned the task.
 * So a supervisor can't transfer the call themselves: instead they record a takeover request on the task,
 * and the assigned counselor's Flex client picks it up and starts a cold transfer to the supervisor.
 */

import { TaskSID, WorkerSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { isErr, newOk } from '@tech-matters/result-type';
import { FlexValidatedHandler } from '../validation/flexToken';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';
import { patchTaskAttributes } from '../task/patchTaskAttributes';
import { validateChannelIfWorker } from './validateChannelIfWorker';

// After this long, a request can no longer be started or block a new one
export const TAKEOVER_REQUEST_TTL_MS = 60 * 1000;

export type TakeoverRequestStatus = 'requested' | 'started' | 'failed';

export type TakeoverRequest = {
  requestedBy: WorkerSID;
  requestedAt: string;
  originalReservation: string;
  originalCounselor: WorkerSID;
  status: TakeoverRequestStatus;
  reason?: string;
};

class CallTakeoverError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const isExpired = (request: TakeoverRequest, now: number) =>
  now - Date.parse(request.requestedAt) > TAKEOVER_REQUEST_TTL_MS;

// A started request that really led to a transfer is caught by the reservation / transferMeta checks,
// so it can expire too: that way a transfer that failed without being reported can't block the task forever
export const isTakeoverRequestInProgress = (
  request: TakeoverRequest | undefined,
  now: number,
): boolean => Boolean(request && request.status !== 'failed' && !isExpired(request, now));

const isTransferInProgress = (
  attributes: Record<string, any>,
  acceptedReservationSid: string,
) => {
  const transferMeta = attributes.transferMeta;
  return (
    transferMeta?.transferStatus === 'transferring' ||
    (transferMeta?.transferStatus === 'accepted' &&
      transferMeta.originalReservation === acceptedReservationSid)
  );
};

const patchTakeoverRequest = async (
  accountSid: Parameters<typeof patchTaskAttributes>[0],
  taskSid: TaskSID,
  updateRequest: (attributes: Record<string, any>) => TakeoverRequest,
) => {
  try {
    const patchResult = await patchTaskAttributes(
      accountSid,
      taskSid,
      attributes => ({ ...attributes, takeoverRequest: updateRequest(attributes) }),
      { requireEtag: true },
    );
    if (isErr(patchResult)) {
      return newHttpErrorResult(patchResult.message, 500);
    }
    return newOk({});
  } catch (err) {
    if (err instanceof CallTakeoverError) {
      return newHttpErrorResult(err.message, err.statusCode);
    }
    return newHttpErrorResult(err as Error, 500);
  }
};

/**
 * Called by a supervisor: records a takeover request on a call task assigned to another worker.
 */
export const requestCallTakeoverHandler: FlexValidatedHandler = async (
  { body, tokenResult },
  accountSid,
) => {
  const { taskSid } = body as { taskSid?: TaskSID };
  if (!taskSid) {
    return newMissingParameterResult('taskSid');
  }
  const supervisorSid = tokenResult.worker_sid as WorkerSID;

  const client = await getTwilioClient(accountSid);
  const workspace = client.taskrouter.v1.workspaces.get(
    await getWorkspaceSid(accountSid),
  );
  const [task, reservations] = await Promise.all([
    workspace.tasks.get(taskSid).fetch(),
    workspace.tasks.get(taskSid).reservations.list(),
  ]);

  if (task.taskChannelUniqueName !== 'voice') {
    return newHttpErrorResult(`Task ${taskSid} is not a call task`, 400);
  }
  const acceptedReservations = reservations.filter(
    reservation => reservation.reservationStatus === 'accepted',
  );
  if (acceptedReservations.length === 0) {
    return newHttpErrorResult(`Task ${taskSid} has no accepted reservation`, 400);
  }
  // More than one accepted reservation means a warm transfer is in progress
  if (acceptedReservations.length > 1) {
    return newHttpErrorResult('A transfer is already active for this task', 409);
  }
  const [acceptedReservation] = acceptedReservations;
  if (acceptedReservation.workerSid === supervisorSid) {
    return newHttpErrorResult(`Task ${taskSid} is already assigned to you`, 400);
  }

  const supervisorValidation = await validateChannelIfWorker(
    accountSid,
    supervisorSid,
    'worker',
    'voice',
    'voice',
      true,
  );
  if (isErr(supervisorValidation)) {
    return newHttpErrorResult(supervisorValidation.message, 400);
  }

  return patchTakeoverRequest(accountSid, taskSid, attributes => {
    if (isTransferInProgress(attributes, acceptedReservation.sid)) {
      throw new CallTakeoverError('A transfer is already active for this task', 409);
    }
    if (isTakeoverRequestInProgress(attributes.takeoverRequest, Date.now())) {
      throw new CallTakeoverError('A take over is already active for this task', 409);
    }
    return {
      requestedBy: supervisorSid,
      requestedAt: new Date().toISOString(),
      originalReservation: acceptedReservation.sid,
      originalCounselor: acceptedReservation.workerSid as WorkerSID,
      status: 'requested',
    };
  });
};

type UpdateStatusBody = {
  taskSid?: TaskSID;
  status?: Exclude<TakeoverRequestStatus, 'requested'>;
  reason?: string;
};

/**
 * Called by the counselor's client to claim a request ('started') or report it couldn't be done ('failed').
 * The requesting supervisor can also mark it 'failed', e.g. when it isn't picked up in time.
 * Claiming uses the task ETag, so only one of the counselor's Flex tabs can start the transfer.
 */
export const updateCallTakeoverStatusHandler: FlexValidatedHandler = async (
  { body, tokenResult },
  accountSid,
) => {
  const { taskSid, status, reason } = body as UpdateStatusBody;
  if (!taskSid) {
    return newMissingParameterResult('taskSid');
  }
  if (status !== 'started' && status !== 'failed') {
    return newHttpErrorResult(`Invalid take over status: ${status}`, 400);
  }
  const callerSid = tokenResult.worker_sid;

  return patchTakeoverRequest(accountSid, taskSid, attributes => {
    const request: TakeoverRequest | undefined = attributes.takeoverRequest;
    if (!request) {
      throw new CallTakeoverError(`Task ${taskSid} has no take over request`, 409);
    }
    const isCounselor = callerSid === request.originalCounselor;
    const isRequestingSupervisor = callerSid === request.requestedBy;
    if (!isCounselor && !(status === 'failed' && isRequestingSupervisor)) {
      throw new CallTakeoverError(
        'Unauthorized: only the counselor assigned the task can update this take over',
        403,
      );
    }
    if (status === 'started') {
      if (request.status !== 'requested') {
        throw new CallTakeoverError('Take over already started or failed', 409);
      }
      if (isExpired(request, Date.now())) {
        throw new CallTakeoverError('Take over request has expired', 409);
      }
    } else if (request.status === 'failed') {
      throw new CallTakeoverError('Take over already failed', 409);
    }
    return { ...request, status, ...(reason ? { reason } : {}) };
  });
};
