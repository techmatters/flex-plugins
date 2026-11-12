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

import { AccountScopedHandler } from '../httpTypes';
import { newOk } from '@tech-matters/result-type';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';

import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';

type WorkerAttributes = {
  routing?: {
    skills?: string[];
  };
  maxMessageCapacity?: number;
};

type WorkerChannelSummary = {
  taskChannelUniqueName: string;
  assignedTasks: number;
  available: boolean;
  availableCapacityPercentage: number;
};

type AvailableWorkerSummary = {
  sid: string;
  friendlyName: string;
  maxMessageCapacity: number;
  workerChannelTasks: WorkerChannelSummary[];
};

/**
 * Returns true if the worker possesses every required skill.
 */
export const hasRequiredSkills = (
  workerSkills: string[],
  requiredSkills: string[],
): boolean => {
  return requiredSkills.every(skill => workerSkills.includes(skill));
};

/**
 * assignedTasks doesn't count tasks in wrap-up, but TaskRouter keeps their capacity until they are
 * completed, so availableCapacityPercentage is what says whether a channel is in use:
 * 100 = nothing assigned or in wrap-up, 0 = configuredCapacity reached.
 */
const isChannelEmpty = (channel?: WorkerChannelSummary): boolean =>
  channel?.availableCapacityPercentage === 100;

/**
 * TaskRouter only reserves a task on a channel the worker has enabled and has capacity left on
 */
const canTakeTask = (channel?: WorkerChannelSummary): boolean =>
  Boolean(channel?.available) && (channel?.availableCapacityPercentage ?? 0) > 0;

/**
 * Determines whether TaskRouter would reserve a task of the target channel to the worker now.
 */
const isWorkerAvailable = (
  worker: AvailableWorkerSummary,
  targetChannel: 'voice' | 'chat',
): boolean => {
  const voiceChannel = worker.workerChannelTasks.find(
    c => c.taskChannelUniqueName === 'voice',
  );

  const chatChannel = worker.workerChannelTasks.find(
    c => c.taskChannelUniqueName === 'chat',
  );
  // for voice both channels must be empty (nothing assigned or in wrap-up)
  if (targetChannel === 'voice') {
    return (
      Boolean(voiceChannel?.available) &&
      isChannelEmpty(voiceChannel) &&
      isChannelEmpty(chatChannel)
    );
  }
  // for chat nothing on voice (no chats while on a call) and capacity left on the chat channel
  return isChannelEmpty(voiceChannel) && canTakeTask(chatChannel);
};

export const isSkilledWorkerAvailableHandler: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const { targetChannel, targetSkills } = body as {
    targetChannel?: string;
    targetSkills?: string;
  };

  /**
   * Validate parameters
   */
  if (!targetSkills) {
    return newMissingParameterResult('targetSkills');
  }

  if (!targetChannel) {
    return newMissingParameterResult('targetChannel');
  }

  if (targetChannel !== 'voice' && targetChannel !== 'chat') {
    return newHttpErrorResult(
      `Invalid targetChannel "${targetChannel}". Must be either "voice" or "chat".`,
      400,
    );
  }
  //We get the required skills as a comma-separated list (already filtered)
  const requiredSkills = targetSkills
    .split(',')
    .map(skill => skill.trim())
    .filter(Boolean);

  if (requiredSkills.length === 0) {
    return newHttpErrorResult(
      `No valid target skills were supplied. Expected a comma-separated list, e.g. "Spanish,Chat".`,
      400,
    );
  }

  console.info('Checking worker availability', {
    accountSid,
    targetChannel,
    requiredSkills,
  });

  /**
   * Create Twilio client
   */
  const client = await getTwilioClient(accountSid);

  /**
   * Retrieve TaskRouter workspace SID from SSM.
   */
  const workspaceSid = await getWorkspaceSid(accountSid);

  console.info('Workspace resolved', {
    accountSid,
    workspaceSid,
  });

  /**
   * Retrieve all workers that TaskRouter considers available.
   */
  const availableWorkers = await client.taskrouter.v1
    .workspaces(workspaceSid)
    .workers.list({
      activityName: 'Available',
      available: 'true',
    });

  console.info('Available workers retrieved', {
    accountSid,
    workerCount: availableWorkers.length,
  });

  /**
   * Filter workers based on routing skills.
   * We iterate only once over the workers instead of using
   * map().filter().filter(), which creates intermediate arrays.
   */
  const skilledWorkers: Array<{
    worker: (typeof availableWorkers)[number];
    attributes: WorkerAttributes;
  }> = [];

  for (const worker of availableWorkers) {
    const attributes = JSON.parse(worker.attributes) as WorkerAttributes;
    const workerSkills = attributes.routing?.skills ?? [];

    if (!hasRequiredSkills(workerSkills, requiredSkills)) {
      console.debug('Worker does not have required skills', {
        accountSid,
        workerSid: worker.sid,
        workerSkills,
        requiredSkills,
      });
      continue;
    }
    skilledWorkers.push({
      worker,
      attributes,
    });
  }

  console.info('Workers matching requested skills', {
    accountSid,
    requiredSkills,
    matchingWorkers: skilledWorkers.length,
  });

  /**
   * Fetch every worker's channel information in parallel.
   * Promise.all() is much faster than waiting for each worker
   * sequentially.
   */
  const availableSkilledWorkers: AvailableWorkerSummary[] = await Promise.all(
    skilledWorkers.map(async ({ worker, attributes }) => {
      console.debug('Loading worker channels', {
        accountSid,
        workerSid: worker.sid,
        workerName: worker.friendlyName,
      });

      const workerChannels = await client.taskrouter.v1
        .workspaces(workspaceSid)
        .workers(worker.sid)
        .workerChannels.list();

      const workerChannelTasks: WorkerChannelSummary[] = workerChannels.map(channel => ({
        taskChannelUniqueName: channel.taskChannelUniqueName,
        assignedTasks: channel.assignedTasks,
        available: channel.available,
        availableCapacityPercentage: channel.availableCapacityPercentage,
      }));

      return {
        sid: worker.sid,
        friendlyName: worker.friendlyName,
        maxMessageCapacity: attributes.maxMessageCapacity ?? 0,
        workerChannelTasks,
      };
    }),
  );

  console.info('Finished loading worker channel information', {
    accountSid,
    workerCount: availableSkilledWorkers.length,
  });

  /**
   * Determine which workers can actually receive another task.
   */
  const availableWorkersForChannel = availableSkilledWorkers.filter(worker => {
    const available = isWorkerAvailable(worker, targetChannel);

    if (available) {
      console.info('Worker is available', {
        accountSid,
        workerSid: worker.sid,
        workerName: worker.friendlyName,
      });
    } else {
      console.debug('Worker is unavailable', {
        accountSid,
        workerSid: worker.sid,
        workerName: worker.friendlyName,
        workerChannelTasks: worker.workerChannelTasks,
      });
    }

    return available;
  });

  const availableWorkerSids = availableWorkersForChannel.map(worker => worker.sid);

  console.info('Availability check completed', {
    accountSid,
    targetChannel,
    requiredSkills,
    totalAvailableWorkers: availableWorkersForChannel.length,
    availableWorkerSids,
  });

  return newOk({
    totalAvailableWorkers: availableWorkersForChannel.length,
    availableWorkerSids,
    availableSkilledWorkers: availableWorkersForChannel,
  });
};
