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

import { AccountSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { FlexValidatedHandler } from '../validation/flexToken';
import { newOk } from '../Result';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';

export const pullTaskHandler: FlexValidatedHandler = async (
  { body: event },
  accountSid: AccountSID,
) => {
  const { workerSid } = event as { workerSid?: string };

  if (workerSid === undefined) {
    return newMissingParameterResult('workerSid');
  }

  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);

  const reservations = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .workers(workerSid)
    .reservations.list({ reservationStatus: 'pending' });

  if (reservations.length === 0) {
    return newHttpErrorResult('No eligible queued task found to pull', 404);
  }

  const reservation = reservations[0];
  await reservation.update({ reservationStatus: 'accepted' });

  return newOk({ taskPulled: reservation.taskSid });
};
