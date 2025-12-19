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
import { updateTaskAndCallStatus } from './updateTaskAndCall';
import { updateReservationStatuses } from './updateReservations';

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
  const completeTaskResult = await updateTaskAndCallStatus(
    await getTwilioClient(accountSid),
    task,
    'completed',
  );

  if (isOk(completeTaskResult)) {
    return completeTaskResult;
  }

  console.error(
    `Error completing task ${taskSid},attempting to complete reservations`,
    completeTaskResult.error.cause,
  );

  // Try to close individual reservations
  const completeReservationsResult = await updateReservationStatuses(
    reservations ?? [],
    'completed',
  );
  if (isErr(completeReservationsResult)) {
    console.error(
      `Error completing reservations for task ${taskSid}`,
      completeReservationsResult.error,
    );
  } else {
    if (completeReservationsResult.data.updatedReservationSids?.length) {
      console.info(
        `Completed reservations for task ${taskSid}: ${completeReservationsResult.data.updatedReservationSids}.`,
      );
    }
    completeReservationsResult.data.updateReservationErrors.map(cre =>
      console.warn('Error completing reservation:', cre),
    );
  }

  return newHttpErrorResult(
    completeTaskResult.error.cause,
    500,
    completeTaskResult.message,
  );
};
