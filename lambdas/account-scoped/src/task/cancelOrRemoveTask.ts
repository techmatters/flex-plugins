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
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';
import { FlexValidatedHandler, isSupervisor } from '../validation/flexToken';
import { isErr, isOk } from '../Result';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import {
  getTaskAndReservations,
  isTaskNotFoundErrorResult,
  VALID_RESERVATION_STATUSES_FOR_TASK_OWNER,
} from './getTaskAndReservations';
import { removeTaskAndCall, updateTaskAndCallStatus } from './updateTaskAndCall';
import { updateReservationStatuses } from './updateReservations';
import { chatChannelJanitor } from '../conversation/chatChannelJanitor';

export const cancelOrRemoveTaskHandler: FlexValidatedHandler = async (
  { body: event, tokenResult },
  accountSid: AccountSID,
) => {
  const { taskSid } = event as { taskSid: TaskSID };

  if (taskSid === undefined) {
    return newMissingParameterResult('taskSid');
  }
  const byLogClause = `by ${isSupervisor(tokenResult) ? 'supervisor' : 'agent'} ${tokenResult.worker_sid}`;
  const lookupResult = await getTaskAndReservations(accountSid, taskSid, tokenResult);
  if (isErr(lookupResult)) {
    return newHttpErrorResult(
      lookupResult.error.cause,
      isTaskNotFoundErrorResult(lookupResult) ? 404 : 500,
    );
  }
  const { task, reservations } = lookupResult.unwrap();
  if (!isSupervisor(tokenResult) && !reservations?.length) {
    return newHttpErrorResult(
      `Unauthorized: Endpoint cannot be invoked unless the calling worker is a supervisor or has a reservation on the target task with one of these statuses: ${VALID_RESERVATION_STATUSES_FOR_TASK_OWNER}`,
      403,
    );
  }
  let result: Awaited<ReturnType<FlexValidatedHandler>>;
  const client = await getTwilioClient(accountSid);

  const cancelTaskResult = await updateTaskAndCallStatus(client, task, 'canceled');

  if (isOk(cancelTaskResult)) {
    result = cancelTaskResult;
  } else {
    console.error(
      `Failed to cancel task ${taskSid} ${byLogClause}, attempting to remove it`,
      cancelTaskResult.message,
      cancelTaskResult.error.cause,
    );
    const cancelReservationsResult = await updateReservationStatuses(
      reservations ?? [],
      'canceled',
    );
    if (isErr(cancelReservationsResult)) {
      console.error(
        `Error cancelling reservations for task ${taskSid} ${byLogClause}`,
        cancelReservationsResult.error,
      );
    } else {
      if (cancelReservationsResult.data.updatedReservationSids?.length) {
        console.info(
          `Cancelled reservations for task ${taskSid}: ${cancelReservationsResult.data.updatedReservationSids}.`,
        );
      }
      cancelReservationsResult.data.updateReservationErrors.map(cre =>
        console.warn(`Error cancelling reservation ${byLogClause}:`, cre),
      );
    }
    const removeResult = await removeTaskAndCall(client, task);
    result = isOk(removeResult)
      ? removeResult
      : newHttpErrorResult(removeResult.error.cause, 500, removeResult.message);
  }

  const taskAttributes = JSON.parse(task?.attributes || 'null');
  try {
    await chatChannelJanitor(accountSid, taskAttributes);
  } catch (error) {
    console.error(
      `Chat channel / conversation janitor failed completing task ${taskSid}, a stale channel / conversation is likely. Task attributes:`,
      taskAttributes,
      error,
    );
  }
  return result;
};
