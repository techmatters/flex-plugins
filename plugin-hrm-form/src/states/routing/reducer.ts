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
import {
  INITIALIZE_CONTACT_STATE,
  InitializeContactStateAction,
  REMOVE_CONTACT_STATE,
  RemoveContactStateAction,
} from '../types';
import { standaloneTaskSid } from '../../types/types';
import getOfflineContactTaskSid from '../contacts/offlineContactTaskSid';

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

export function reduce(
  state = initialState,
  action: RoutingActionType | InitializeContactStateAction | RemoveContactStateAction,
): RoutingState {
  switch (action.type) {
    case INITIALIZE_CONTACT_STATE: {
      let initialEntry: AppRoutes = newTaskEntry;
      const { callType } = action.initialContact.rawJson;
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
        ...state,
        tasks: {
          ...state.tasks,
          [action.initialContact.taskId]:
            action.recreated && state.tasks[action.initialContact.taskId]
              ? state.tasks[action.initialContact.taskId]
              : initialEntry,
        },
        isAddingOfflineContact:
          action.initialContact.taskId === getOfflineContactTaskSid() ? true : state.isAddingOfflineContact,
      };
    }
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
