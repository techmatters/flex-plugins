import { ITask } from '@twilio/flex-ui';

import fetchProtectedApi from './fetchProtectedApi';
import { TaskSID } from '../types/twilio';

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
