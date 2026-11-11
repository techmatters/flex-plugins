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

import { REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../types';
import type { RootState } from '..';
import { namespace } from '../storeNamespaces';

type QueueGreetingsMetadata = {
  dismissedPopup: boolean;
};

// UI state that belongs to a single task, kept independently of its contact or route stack
type TaskMetadata = {
  queueGreetings?: QueueGreetingsMetadata;
};

type TaskScopedMetadataState = {
  [taskId: string]: TaskMetadata;
};

const initialState: TaskScopedMetadataState = {};

const SET_QUEUE_GREETING_POPUP_DISMISSED = 'taskScopedMetadata/set-queue-greeting-popup-dismissed';
type SetQueueGreetingPopupDismissedAction = {
  type: typeof SET_QUEUE_GREETING_POPUP_DISMISSED;
  taskId: string;
  dismissedPopup: boolean;
};
export const newSetQueueGreetingPopupDismissedAction = (
  taskId: string,
  dismissedPopup: boolean,
): SetQueueGreetingPopupDismissedAction => ({
  type: SET_QUEUE_GREETING_POPUP_DISMISSED,
  taskId,
  dismissedPopup,
});

export const selectIsQueueGreetingPopupDismissed = (state: RootState, taskId: string): boolean =>
  Boolean(state[namespace].taskScopedMetadata[taskId]?.queueGreetings?.dismissedPopup);

type TaskScopedMetadataAction = SetQueueGreetingPopupDismissedAction | RemoveContactStateAction;

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
    case REMOVE_CONTACT_STATE: {
      return omit(state, action.taskId);
    }
    default:
      return state;
  }
};
