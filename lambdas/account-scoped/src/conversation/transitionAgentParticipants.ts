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

import { AccountSID, TaskSID } from '@tech-matters/twilio-types';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';
import { newErr, newOk, isErr } from '../Result';
import { FlexValidatedHandler, isSupervisor } from '../validation/flexToken';
import {
  getTaskAndReservations,
  isTaskNotFoundErrorResult,
  VALID_RESERVATION_STATUSES_FOR_TASK_OWNER,
} from '../task/getTaskAndReservations';
import { transitionAgentParticipants } from './interactionChannelParticipants';

export const transitionAgentParticipantsHandler: FlexValidatedHandler = async (
  { body: event, tokenResult },
  accountSid: AccountSID,
) => {
  const { taskSid, targetStatus, interactionChannelParticipantSid } = event as {
    taskSid: TaskSID;
    targetStatus: string;
    interactionChannelParticipantSid?: string;
  };

  if (!taskSid) {
    return newMissingParameterResult('taskSid');
  }
  if (!targetStatus) {
    return newMissingParameterResult('targetStatus');
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

  try {
    const taskAttributes = JSON.parse(task.attributes || '{}');
    const client = await getTwilioClient(accountSid);
    await transitionAgentParticipants(
      client,
      taskAttributes,
      targetStatus,
      interactionChannelParticipantSid,
    );
    return newOk({ message: 'Participants transitioned successfully' });
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
