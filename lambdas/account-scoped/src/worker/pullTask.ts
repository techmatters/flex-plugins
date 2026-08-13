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

import { AccountSID, WorkerSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { FlexValidatedHandler } from '../validation/flexToken';
import { newOk } from '../Result';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';
import { adjustChatCapacity } from '../conversation/adjustChatCapacity';

const PULL_ATTEMPT_TIMEOUT_MS = 5000;

const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export const pullTaskHandler: FlexValidatedHandler = async (
  { body: event },
  accountSid: AccountSID,
) => {
  const { workerSid } = event as { workerSid?: WorkerSID };

  if (workerSid === undefined) {
    return newMissingParameterResult('workerSid');
  }

  try {
    const client = await getTwilioClient(accountSid);
    const workspaceSid = await getWorkspaceSid(accountSid);

    const { status } = await adjustChatCapacity(accountSid, {
      workerSid,
      adjustment: 'increaseUntilCapacityAvailable',
    });
    if (status !== 200) {
      return newHttpErrorResult('Failed to provide available chat capacity', 400);
    }

    const pullAttemptExpiry = Date.now() + PULL_ATTEMPT_TIMEOUT_MS;

    while (Date.now() < pullAttemptExpiry) {
      await delay(500);

      const reservations = await client.taskrouter.v1
        .workspaces(workspaceSid)
        .workers(workerSid)
        .reservations.list({ reservationStatus: 'pending' });

      if (reservations.length > 0) {
        const reservation = reservations[0];
        console.debug('New task reserved for worker pulled:', reservation.taskSid);
        // await reservation.update({ reservationStatus: 'accepted' });
        return newOk({ taskPulled: reservation.taskSid });
      }
    }

    return newHttpErrorResult('No eligible queued task found to pull', 404);
  } catch (err) {
    return newHttpErrorResult(
      err instanceof Error ? err.message : String(err),
      500,
      'Unknown error occurred',
    );
  } finally {
    await adjustChatCapacity(accountSid, { workerSid, adjustment: 'setTo1' });
  }
};
