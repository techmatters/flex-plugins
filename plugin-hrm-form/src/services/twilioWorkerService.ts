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

import { getHrmConfig } from '../hrmConfig';
import fetchProtectedApi from './fetchProtectedApi';
import { TaskSID } from '../types/twilio';
import { ApiError } from './fetchApi';

type PopulateCounselorsReturn = { sid: string; fullName: string }[];

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 */
export const populateCounselors = async (): Promise<PopulateCounselorsReturn> => {
  const { helpline, currentWorkspace } = getHrmConfig();
  const body = {
    workspaceSID: currentWorkspace,
    helpline: helpline || '',
  };

  const { workerSummaries } = await fetchProtectedApi('/populateCounselors', body);

  return workerSummaries;
};

/**
 * Change the capacity for simultaneous chat sessions for a worker.
 * @deprecated This should no longer be called from flex once backend manual pulling is activated for all helplines
 * @param adjustment
 */
export const adjustChatCapacity = async (adjustment: 'increase' | 'decrease'): Promise<void> => {
  const { workerSid } = getHrmConfig();

  const body = {
    workerSid,
    adjustment,
  };

  return fetchProtectedApi('/adjustChatCapacity', body);
};

export const pullNextTask = async (): Promise<TaskSID | undefined> => {
  const { workerSid } = getHrmConfig();

  const body = {
    workerSid,
  };
  try {
    return (await fetchProtectedApi('/pullTask', body)).taskPulled;
  } catch (e) {
    if (e instanceof ApiError && e.response.status === 404) {
      console.warn('No eligible queued task found to pull');
      return undefined;
    }
    throw e;
  }
};

/**
 * Returns the task queues list for a given worker.
 */
export const listWorkerQueues = async (body: {
  workerSid: string;
}): Promise<{ workerQueues: { friendlyName: string }[] }> => {
  return fetchProtectedApi('/listWorkerQueues', body);
};

/**
 * Gets the attributes of the target worker
 */
export const getWorkerAttributes = async (workerSid: string) => {
  const body = { workerSid };

  return fetchProtectedApi('/getWorkerAttributes', body);
};
