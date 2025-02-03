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

import fetchProtectedApi from './fetchProtectedApi';
import { TaskSID } from '../types/twilio';
import { FetchOptions } from './fetchApi';

/**
 * Creates a new task (offline contact) in behalf of targetSid worker with attributes. Other attributes for routing are added to the task in the implementation of assignOfflineContact serverless function
 */
export const assignOfflineContactInit = async (targetSid: string, taskAttributes: ITask['attributes']) => {
  const body = {
    targetSid,
    taskAttributes: JSON.stringify(taskAttributes),
  };

  return fetchProtectedApi('/assignOfflineContactInit', body);
};

type OfflineContactComplete = {
  action: 'complete';
  taskSid: string;
  finalTaskAttributes: ITask['attributes'];
};
type OfflineContactRemove = {
  action: 'remove';
  taskSid: string;
};

/**
 * Completes or removes the task (offline contact) in behalf of targetSid worker updating with finalTaskAttributes.
 */
export const assignOfflineContactResolve = async (payload: OfflineContactComplete | OfflineContactRemove) => {
  const body =
    payload.action === 'complete'
      ? {
          ...payload,
          finalTaskAttributes: JSON.stringify(payload.finalTaskAttributes),
        }
      : payload;

  return fetchProtectedApi('/assignOfflineContactResolve', body);
};

/**
 * Wraps up a conversations task using the interactions API rather than the default actions API.
 * This prevents the underlying conversation being closed so a post survey can vbe performed.
 */
export const wrapupConversationTask = async (taskSid: TaskSID) =>
  fetchProtectedApi('/interaction/transitionAgentParticipants', { taskSid, targetStatus: 'wrapup' });

/**
 * Completes a conversations task using the interactions API rather than the default actions API.
 * This prevents the underlying conversation being closed so a post survey can vbe performed.
 */
export const completeConversationTask = async (taskSid: TaskSID) =>
  fetchProtectedApi('/interaction/transitionAgentParticipants', { taskSid, targetStatus: 'closed' });

export const checkTaskAssignment = async (taskSid: string) => {
  const body = { taskSid };

  return fetchProtectedApi('/checkTaskAssignment', body);
};

type GetTaskAndReservationsResponse = {
  task?: ITask;
  reservations?: any[] | undefined;
} | null;

export const getTaskAndReservations = async (taskSid: string): Promise<GetTaskAndReservationsResponse> => {
  const body = { taskSid };
  const options: FetchOptions = {
    returnNullFor404: true,
    returnUndefinedFor404: true,
  };
  try {
    return await fetchProtectedApi('/getTaskAndReservations', body, options);
  } catch (error) {
    console.error('An error occurred while fetching task and reservations:', error);
    throw error;
  }
};

export const completeTaskAssignment = async (taskSid: string) => {
  const body = { taskSid };

  return fetchProtectedApi('/completeTaskAssignment', body);
};
