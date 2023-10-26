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
import { callTypes } from 'hrm-form-definitions';

import { AppRoutes, RoutingActionType, CHANGE_ROUTE } from './types';
import { REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../types';
import { standaloneTaskSid } from '../../types/types';
import getOfflineContactTaskSid from '../contacts/offlineContactTaskSid';
import {
  ContactUpdatingAction,
  CREATE_CONTACT_ACTION_FULFILLED,
  LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED,
  UPDATE_CONTACT_ACTION_FULFILLED,
} from '../contacts/types';

type RoutingState = {
  tasks: {
    [taskId: string]: AppRoutes;
  };
  isAddingOfflineContact: boolean;
};

export const newTaskEntry = {
  route: 'select-call-type' as const,
};

export const initialState: RoutingState = {
  tasks: {
    [standaloneTaskSid]: newTaskEntry,
  },
  isAddingOfflineContact: false,
};

const contactUpdatingReducer = (state: RoutingState, action: ContactUpdatingAction): RoutingState => {
  const recreated = action.type === LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED;

  const { contact, previousContact } = action.payload;
  if (!contact) {
    return state;
  }
  let stateWithoutPreviousContact = state;
  if (previousContact && previousContact.taskId !== contact.taskId) {
    stateWithoutPreviousContact = {
      ...state,
      tasks: omit(state.tasks, previousContact.taskId),
      isAddingOfflineContact:
        previousContact.taskId === getOfflineContactTaskSid() ? false : state.isAddingOfflineContact,
    };
  }
  const { taskId, rawJson } = contact;
  let initialEntry: AppRoutes = newTaskEntry;
  const { callType } = rawJson;
  if (callType === callTypes.child) {
    initialEntry = {
      route: 'tabbed-forms',
      subroute: 'childInformation',
    };
  } else if (callType === callTypes.caller) {
    initialEntry = {
      route: 'tabbed-forms',
      subroute: 'callerInformation',
    };
  }
  return {
    ...stateWithoutPreviousContact,
    tasks: {
      ...stateWithoutPreviousContact.tasks,
      [taskId]:
        recreated && stateWithoutPreviousContact.tasks[taskId]
          ? stateWithoutPreviousContact.tasks[taskId]
          : initialEntry,
    },
    isAddingOfflineContact:
      taskId === getOfflineContactTaskSid() && contact?.rawJson?.contactlessTask?.createdOnBehalfOf
        ? true
        : stateWithoutPreviousContact.isAddingOfflineContact,
  };
};

export function reduce(
  state = initialState,
  action: RoutingActionType | RemoveContactStateAction | ContactUpdatingAction,
): RoutingState {
  switch (action.type) {
    case CREATE_CONTACT_ACTION_FULFILLED:
    case LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED:
    case UPDATE_CONTACT_ACTION_FULFILLED:
      return contactUpdatingReducer(state, action);
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
        isAddingOfflineContact: action.taskId === getOfflineContactTaskSid() ? false : state.isAddingOfflineContact,
      };
    case CHANGE_ROUTE: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: action.routing,
        },
      };
    }
    default:
      return state;
  }
}
