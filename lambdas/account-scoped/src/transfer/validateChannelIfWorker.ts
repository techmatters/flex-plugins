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

import { AccountSID } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { newErr, newOk, Result } from '@tech-matters/result-type';
import { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';

type ValidationResult = { type: 'worker'; worker: WorkerInstance } | { type: 'queue' };

// If the transfer targets a worker, validate that the worker is online and has capacity.
export async function validateChannelIfWorker(
  accountSid: AccountSID,
  targetSid: string,
  transferTargetType: string,
  taskChannelUniqueName: string,
  channelType: string,
): Promise<Result<Error, ValidationResult>> {
  const client = await getTwilioClient(accountSid);
  const workspaceSid = await getWorkspaceSid(accountSid);
  if (transferTargetType === 'queue') return newOk({ type: 'queue' });

  const [worker, workerChannel] = await Promise.all([
    client.taskrouter.v1.workspaces.get(workspaceSid).workers.get(targetSid).fetch(),
    client.taskrouter.v1.workspaces
      .get(workspaceSid)
      .workers.get(targetSid)
      .workerChannels.get(taskChannelUniqueName)
      .fetch(),
  ]);

  if (!worker.available) {
    return newErr({
      message: `Can't transfer to an offline counselor`,
      error: new Error("Can't transfer to an offline counselor"),
    });
  }

  const workerAttr = JSON.parse(worker.attributes);

  const unavailableVoice =
    channelType === 'voice' && !workerChannel.availableCapacityPercentage;
  const unavailableChat = workerAttr.maxMessageCapacity
    ? channelType !== 'voice' &&
      !workerChannel.availableCapacityPercentage &&
      workerChannel.configuredCapacity >= workerAttr.maxMessageCapacity
    : channelType !== 'voice' && !workerChannel.availableCapacityPercentage;

  if (unavailableVoice || unavailableChat) {
    return newErr({
      message: `Counselor has no available capacity: ${unavailableVoice ? 'voice' : 'chat'} capacity full`,
      error: new Error('Counselor has no available capacity'),
    });
  }

  return newOk({ type: 'worker', worker });
}
