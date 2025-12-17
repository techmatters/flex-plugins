// Get task as a supervisor
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
  FlexValidatedHandler,
  isSupervisor,
  TokenValidatorResponse,
} from '../validation/flexToken';
import type { AccountSID, TaskSID } from '@tech-matters/twilio-types';
import { ErrorResult, isErr, newErr, newOk, Result } from '../Result';
import type { HttpError } from '../httpTypes';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { newMissingParameterResult } from '../httpErrors';
import type {
  ReservationInstance,
  ReservationStatus,
} from 'twilio/lib/rest/taskrouter/v1/workspace/task/reservation';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';

type TaskNotFoundErrorResultPayload = { type: 'TaskNotFoundError'; cause: Error };

type UnknownErrorResultPayload = { type: 'UnknownError'; cause: Error };

export const isTaskNotFoundErrorResult = (
  result: Result<unknown, unknown>,
): result is ErrorResult<TaskNotFoundErrorResultPayload> =>
  isErr(result) &&
  (result.error as TaskNotFoundErrorResultPayload).type === 'TaskNotFoundError';

// Reservation statuses valid for a worker considered to be an 'owner' of a task
export const VALID_RESERVATION_STATUSES_FOR_TASK_OWNER: ReservationStatus[] = [
  'completed',
  'wrapping',
  'accepted',
];
export const getTaskAndReservations = async (
  accountSid: AccountSID,
  taskSid: TaskSID,
  tokenResult: TokenValidatorResponse,
): Promise<
  Result<
    TaskNotFoundErrorResultPayload | UnknownErrorResultPayload,
    { task: TaskInstance; reservations: ReservationInstance[] | undefined }
  >
> => {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);
  const taskContext = client.taskrouter.v1.workspaces
    .get(workspaceSid)
    .tasks.get(taskSid);
  let reservations: ReservationInstance[] | undefined = undefined;
  try {
    reservations = await taskContext.reservations.list();

    if (reservations.length === 0) {
      console.info(`No reservations found for task ${taskSid}`);
    } else if (!isSupervisor(tokenResult)) {
      reservations = reservations.filter(
        reservation =>
          reservation.workerSid === tokenResult.worker_sid &&
          VALID_RESERVATION_STATUSES_FOR_TASK_OWNER.includes(
            reservation.reservationStatus,
          ),
      );
      if (reservations.length === 0) {
        console.info(
          `No reservations found for worker ${tokenResult.worker_sid} on task ${taskSid} in any of these states:`,
          VALID_RESERVATION_STATUSES_FOR_TASK_OWNER,
        );
      }
    }
  } catch (err) {
    console.error(`Failed to fetch reservations for task ${taskSid}:`, err);
  }

  try {
    const task = await client.taskrouter.v1.workspaces
      .get(workspaceSid)
      .tasks.get(taskSid)
      .fetch();

    return newOk({ task, reservations });
  } catch (err: any) {
    const error = err as Error;
    if (
      error.message.match(
        /The requested resource \/Workspaces\/WS[a-z0-9]+\/Tasks\/WT[a-z0-9]+ was not found/,
      )
    ) {
      return newErr<TaskNotFoundErrorResultPayload>({
        message: `Task with sid ${taskSid} not found`,
        error: { type: 'TaskNotFoundError', cause: error } as const,
      });
    }
    return newErr<UnknownErrorResultPayload>({
      message: err.message,
      error: { type: 'UnknownError', cause: error } as const,
    });
  }
};

export const getTaskAndReservationsHandler: FlexValidatedHandler = async (
  { body: event, tokenResult },
  accountSid,
) => {
  const { taskSid } = event as { taskSid: TaskSID };

  if (taskSid === undefined) {
    return newMissingParameterResult('taskSid');
  }

  const result = await getTaskAndReservations(accountSid, taskSid, tokenResult);

  if (isErr(result)) {
    return newErr<HttpError>({
      message: result.message,
      error: {
        statusCode: isTaskNotFoundErrorResult(result) ? 404 : 500,
        cause: result.error.cause,
      },
    });
  }
  return result;
};
