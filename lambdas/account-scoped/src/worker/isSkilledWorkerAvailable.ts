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
import { newOk } from '../Result';
import { newHttpErrorResult, newMissingParameterResult } from '../httpErrors';

import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';

interface WorkerAttributes {
  routing?: {
    skills?: string[];
  };
  maxMessageCapacity?: number;
}

interface WorkerChannelSummary {
  taskChannelUniqueName: string;
  assignedTasks: number;
}

interface AvailableWorkerSummary {
  sid: string;
  friendlyName: string;
  maxMessageCapacity: number;
  workerChannelTasks: WorkerChannelSummary[];
}

/**
 * Safely parse worker attributes.
 * Returns null if the JSON is malformed.
 */
const parseWorkerAttributes = (attributes: string): WorkerAttributes | null => {
  try {
    return JSON.parse(attributes) as WorkerAttributes;
  } catch {
    return null;
  }
};

/**
 * Returns true if the worker possesses every required skill.
 */
const hasRequiredSkills = (workerSkills: string[], requiredSkills: string[]): boolean => {
  return requiredSkills.every(skill => workerSkills.includes(skill));
};

/**
 * Determines whether a worker can receive another task.
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
  //This part has important logic, for voice we need both channels to have 0 assigned tasks
  if (targetChannel === 'voice') {
    return (
      (voiceChannel?.assignedTasks ?? -1) === 0 &&
      (chatChannel?.assignedTasks ?? -1) === 0
    );
  }
  //for chat we need voice to have 0 assigned tasks and chat to have less than maxMessageCapacity
  return (
    (voiceChannel?.assignedTasks ?? -1) === 0 &&
    (chatChannel?.assignedTasks ?? Number.MAX_SAFE_INTEGER) < worker.maxMessageCapacity
  );
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
    const attributes = parseWorkerAttributes(worker.attributes);

    if (!attributes) {
      console.warn('Skipping worker due to invalid attributes', {
        accountSid,
        workerSid: worker.sid,
        workerName: worker.friendlyName,
      });
      continue;
    }

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
  const availableSkilledWorkersData: AvailableWorkerSummary[] = await Promise.all(
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
    workerCount: availableSkilledWorkersData.length,
  });

  /**
   * Determine which workers can actually receive another task.
   */
  const availableWorkersForChannel = availableSkilledWorkersData.filter(worker => {
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
    availableSkilledWorkersData: availableWorkersForChannel,
  });
};
