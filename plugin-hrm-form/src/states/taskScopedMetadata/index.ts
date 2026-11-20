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

import { omit } from 'lodash';
import { Actions, Notifications, TaskHelper } from '@twilio/flex-ui';
import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../types';
import type { RootState } from '..';
import { namespace } from '../storeNamespaces';
import { requestCallTakeover, updateCallTakeoverStatus } from '../../services/twilioTaskService';
import { stopMonitoringCall, TAKEOVER_FAILED_NOTIFICATION_ID } from '../../transfer/takeoverReservation';
import { TaskSID } from '../../types/twilio';

type QueueGreetingsMetadata = {
  dismissedPopup: boolean;
};

// A supervisor taking over the task from the counselor assigned it
type TakeoverMetadata = {
  status: 'pending' | 'failed';
  // An earlier, failed call take over request may still be on the task until ours replaces it
  requestedAtBeforeTakeover?: string;
  error?: string;
};

// UI state that belongs to a single task, kept independently of its contact or route stack
type TaskMetadata = {
  queueGreetings?: QueueGreetingsMetadata;
  flexTransferActionInProgress?: boolean;
  takeover?: TakeoverMetadata;
};

type TaskScopedMetadataState = {
  [taskId: string]: TaskMetadata;
};

const initialState: TaskScopedMetadataState = {};

const SET_QUEUE_GREETING_POPUP_DISMISSED = 'taskScopedMetadata/set-queue-greeting-popup-dismissed';
const SET_FLEX_TRANSFER_ACTION_IN_PROGRESS = 'taskScopedMetadata/set-flex-transfer-action-in-progress';
type SetQueueGreetingPopupDismissedAction = {
  type: typeof SET_QUEUE_GREETING_POPUP_DISMISSED;
  taskId: string;
  dismissedPopup: boolean;
};
type SetFlexTransferActionInProgressAction = {
  type: typeof SET_FLEX_TRANSFER_ACTION_IN_PROGRESS;
  taskId: string;
  inProgress: boolean;
};
export const newSetQueueGreetingPopupDismissedAction = (
  taskId: string,
  dismissedPopup: boolean,
): SetQueueGreetingPopupDismissedAction => ({
  type: SET_QUEUE_GREETING_POPUP_DISMISSED,
  taskId,
  dismissedPopup,
});

export const newSetFlexTransferActionInProgressAction = (
  taskId: string,
  inProgress: boolean,
): SetFlexTransferActionInProgressAction => ({
  type: SET_FLEX_TRANSFER_ACTION_IN_PROGRESS,
  taskId,
  inProgress,
});

export const selectIsQueueGreetingPopupDismissed = (state: RootState, taskId: string): boolean =>
  Boolean(state[namespace].taskScopedMetadata[taskId]?.queueGreetings?.dismissedPopup);

export const selectIsFlexTransferActionInProgress = (state: RootState, taskId: string): boolean =>
  Boolean(state[namespace].taskScopedMetadata[taskId]?.flexTransferActionInProgress);

export const selectTakeover = (state: RootState, taskId: string): TakeoverMetadata | undefined =>
  state[namespace].taskScopedMetadata[taskId]?.takeover;

const START_TAKEOVER = 'taskScopedMetadata/start-takeover';
export const newStartTakeoverAsyncAction = createAsyncAction(
  START_TAKEOVER,
  async (task: ITask, supervisorWorkerSid: string): Promise<void> => {
    if (!TaskHelper.isCallTask(task)) {
      await Actions.invokeAction('TransferTask', { task, targetSid: supervisorWorkerSid, options: { mode: 'COLD' } });
      return;
    }
    // Calls can only be transferred by the counselor's client, so ask it to transfer the call to us
    try {
      await stopMonitoringCall();
      await requestCallTakeover({ taskSid: task.taskSid as TaskSID });
    } catch (error) {
      Notifications.showNotificationSingle(TAKEOVER_FAILED_NOTIFICATION_ID);
      throw error;
    }
  },
  (task: ITask) => ({
    taskSid: task.taskSid,
    requestedAtBeforeTakeover: task.attributes?.takeoverRequest?.requestedAt as string | undefined,
  }),
);

const FAIL_CALL_TAKEOVER = 'taskScopedMetadata/fail-call-takeover';
/**
 * @param markRequestFailed - true when the failure was detected by the supervisor (e.g. timeout) rather than reported on the request by the counselor's client
 */
export const newFailCallTakeoverAsyncAction = createAsyncAction(
  FAIL_CALL_TAKEOVER,
  async (taskSid: TaskSID, reason: string, markRequestFailed: boolean): Promise<void> => {
    console.warn(`Call take over of task ${taskSid} failed: ${reason}`);
    if (markRequestFailed) {
      // So a counselor client that comes back late doesn't act on it
      await updateCallTakeoverStatus({ taskSid, status: 'failed', reason }).catch(error =>
        console.error(`Failed to mark call take over of task ${taskSid} as failed`, error),
      );
    }
    Notifications.showNotificationSingle(TAKEOVER_FAILED_NOTIFICATION_ID);
  },
  (taskSid: TaskSID, reason: string) => ({ taskSid, reason }),
);

const CLEAR_TAKEOVER = 'taskScopedMetadata/clear-takeover';
type ClearTakeoverAction = {
  type: typeof CLEAR_TAKEOVER;
  taskId: string;
};
// The transfer has started, so the take over is no longer pending
export const newClearTakeoverAction = (taskId: string): ClearTakeoverAction => ({
  type: CLEAR_TAKEOVER,
  taskId,
});

const setTakeover = (
  state: TaskScopedMetadataState,
  taskId: string,
  takeover: TakeoverMetadata | undefined,
): TaskScopedMetadataState => ({
  ...state,
  [taskId]: {
    ...state[taskId],
    takeover,
  },
});

const takeoverReducer = createReducer(initialState, handleAction => [
  handleAction(newStartTakeoverAsyncAction.pending, (state, { meta: { taskSid, requestedAtBeforeTakeover } }: any) =>
    setTakeover(state, taskSid, { status: 'pending', requestedAtBeforeTakeover }),
  ),
  handleAction(newStartTakeoverAsyncAction.rejected, (state, { payload, meta: { taskSid } }: any) =>
    setTakeover(state, taskSid, { status: 'failed', error: (payload as Error)?.message }),
  ),
  handleAction(newFailCallTakeoverAsyncAction.fulfilled, (state, { meta: { taskSid, reason } }: any) =>
    setTakeover(state, taskSid, { status: 'failed', error: reason }),
  ),
]);

type TaskScopedMetadataAction =
  | SetQueueGreetingPopupDismissedAction
  | SetFlexTransferActionInProgressAction
  | ClearTakeoverAction
  | RemoveContactStateAction;

export const reduce = (state = initialState, action: TaskScopedMetadataAction): TaskScopedMetadataState => {
  switch (action.type) {
    case SET_QUEUE_GREETING_POPUP_DISMISSED: {
      return {
        ...state,
        [action.taskId]: {
          ...state[action.taskId],
          queueGreetings: { dismissedPopup: action.dismissedPopup },
        },
      };
    }
    case SET_FLEX_TRANSFER_ACTION_IN_PROGRESS: {
      return {
        ...state,
        [action.taskId]: {
          ...state[action.taskId],
          flexTransferActionInProgress: action.inProgress,
        },
      };
    }
    case CLEAR_TAKEOVER: {
      return setTakeover(state, action.taskId, undefined);
    }
    case REMOVE_CONTACT_STATE: {
      return omit(state, action.taskId);
    }
    default:
      return takeoverReducer(state, action as any);
  }
};
