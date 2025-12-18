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
// Close task as a supervisor
import { AccountSID, TaskSID } from '@tech-matters/twilio-types';
import { newMissingParameterResult } from '../httpErrors';
import { FlexValidatedHandler, isSupervisor } from '../validation/flexToken';
import { isErr, isOk, newErr, newOk, Result } from '../Result';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { Twilio } from 'twilio';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import {
  getTaskAndReservations,
  isTaskNotFoundErrorResult,
  VALID_RESERVATION_STATUSES_FOR_TASK_OWNER,
} from './getTaskAndReservations';
import type { HttpError } from '../httpTypes';
import { ReservationInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task/reservation';

type AssignmentResult = Result<{ cause: Error }, { completedTask: TaskInstance }>;
type CompleteReservationsResult = Result<
  { cause: Error },
  {
    completedReservationSids: string[];
    completeReservationErrors: Error[];
  }
>;

const completeReservations = async (
  reservations: ReservationInstance[],
): Promise<CompleteReservationsResult> => {
  try {
    const results = await Promise.allSettled(
      reservations
        .filter(r => ['wrapping', 'accepted'].includes(r.reservationStatus))
        .map(async r => {
          console.debug(
            `Attempting to complete reservation ${r.sid} on task ${r.taskSid} for worker ${r.workerSid}, status: ${r.reservationStatus}`,
          );
          await r.update({
            reservationStatus: 'completed',
          });
          console.debug(
            `Completed reservation ${r.sid} on task ${r.taskSid} for worker ${r.workerSid}, status: ${r.reservationStatus}`,
          );
          return r.sid;
        }),
    );
    return newOk({
      completedReservationSids: results
        .map(r => (r.status === 'fulfilled' ? r.value : undefined))
        .filter(Boolean) as string[],
      completeReservationErrors: results
        .map(r => (r.status === 'rejected' ? r.reason : undefined))
        .filter(Boolean) as Error[],
    });
  } catch (err) {
    const error = err as Error;
    return newErr({
      message: error.message,
      error: {
        cause: error,
      },
    });
  }
};

const completeTaskAssignment = async (
  client: Twilio,
  task: TaskInstance,
): Promise<AssignmentResult> => {
  try {
    const attributes = JSON.parse(task.attributes);
    const callSid = attributes?.call_sid;

    // Ends the task for the worker and client for chat tasks, and only for the worker for voice tasks
    const completedTask = await task.update({
      assignmentStatus: 'completed',
    });

    // Ends the call for the client for voice
    if (callSid) await client.calls(callSid).update({ status: 'completed' });

    return newOk({ completedTask });
  } catch (err) {
    const error = err as Error;
    return newErr({
      message: error.message,
      error: { cause: error },
    });
  }
};

export const completeTaskAssignmentHandler: FlexValidatedHandler = async (
  { body: event, tokenResult },
  accountSid: AccountSID,
) => {
  const { taskSid } = event as { taskSid: TaskSID };

  if (taskSid === undefined) {
    return newMissingParameterResult('taskSid');
  }

  const lookupResult = await getTaskAndReservations(accountSid, taskSid, tokenResult);
  if (isErr(lookupResult)) {
    return newErr<HttpError>({
      ...lookupResult,
      error: {
        ...lookupResult.error,
        statusCode: isTaskNotFoundErrorResult(lookupResult) ? 404 : 500,
      },
    });
  }
  const { task, reservations } = lookupResult.unwrap();
  if (!isSupervisor(tokenResult) && !reservations?.length) {
    return newErr({
      message: `Unauthorized: Endpoint cannot be invoked unless the calling worker is a supervisor or has a reservation on the target task with one of these statuses: ${VALID_RESERVATION_STATUSES_FOR_TASK_OWNER}`,
      error: { statusCode: 403 },
    });
  }
  const completeReservationsResult = await completeReservations(reservations ?? []);
  if (isErr(completeReservationsResult)) {
    console.error(
      `Error completing reservations for task ${taskSid}`,
      completeReservationsResult.error,
    );
  }
  const completeTaskResult = await completeTaskAssignment(
    await getTwilioClient(accountSid),
    task,
  );

  return isOk(completeTaskResult)
    ? completeTaskResult
    : { ...completeTaskResult, error: { ...completeTaskResult.error, statusCode: 500 } };
};
