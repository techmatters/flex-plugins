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
import '@twilio-labs/serverless-runtime-types';
import { AccountSID, TaskSID } from '@tech-matters/twilio-types';
import { newMissingParameterResult } from '../httpErrors';
import type {
  FlexValidatedHandler,
  TokenValidatorResponse,
} from '../validation/flexToken';
import { isErr, isOk, newErr, newOk, Result } from '../Result';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { Twilio } from 'twilio';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import {
  getTaskAndReservations,
  isTaskNotFoundErrorResult,
  VALID_RESERVATION_STATUSES_FOR_TASK_OWNER,
} from './getTaskAndReservations';
import { HttpError } from '../httpTypes';

type AssignmentResult = Result<{ cause: Error }, { completedTask: TaskInstance }>;

const closeTaskAssignment = async (
  client: Twilio,
  task: TaskInstance,
  finalTaskAttributes: string,
): Promise<AssignmentResult> => {
  try {
    const attributes = JSON.parse(task.attributes);
    const callSid = attributes?.call_sid;

    // Ends the task for the worker and client for chat tasks, and only for the worker for voice tasks
    const completedTask = await task.update({
      assignmentStatus: 'completed',
      attributes: finalTaskAttributes,
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

const isSupervisor = (tokenResult: TokenValidatorResponse) =>
  Array.isArray(tokenResult.roles) && tokenResult.roles.includes('supervisor');

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
  const closeResult = await closeTaskAssignment(
    await getTwilioClient(accountSid),
    task,
    JSON.stringify({}),
  );

  return isOk(closeResult)
    ? closeResult
    : { ...closeResult, error: { ...closeResult.error, statusCode: 500 } };
};
