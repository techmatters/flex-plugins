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

import {
  AppRoutes,
  CHANGE_ROUTE,
  CLOSE_MODAL,
  GO_BACK,
  isRouteWithModalSupport,
  OPEN_MODAL,
  RoutingActionType,
  RoutingState,
} from './types';
import { REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../types';
import { standaloneTaskSid } from '../../types/types';
import getOfflineContactTaskSid from '../contacts/offlineContactTaskSid';
import {
  ContactUpdatingAction,
  CREATE_CONTACT_ACTION_FULFILLED,
  LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED,
  UPDATE_CONTACT_ACTION_FULFILLED,
} from '../contacts/types';

export const newTaskEntry = {
  route: 'select-call-type' as const,
};

export const initialState: RoutingState = {
  tasks: {
    [standaloneTaskSid]: [{ route: 'case-list', subroute: 'case-list' }],
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
          : [initialEntry],
    },
    isAddingOfflineContact:
      taskId === getOfflineContactTaskSid() ? true : stateWithoutPreviousContact.isAddingOfflineContact,
  };
};

const removeEmptyModalStack = (routeStack: AppRoutes[]): AppRoutes[] => {
  if (routeStack?.length) {
    const currentRoute = routeStack[routeStack.length - 1];
    if (isRouteWithModalSupport(currentRoute) && currentRoute.activeModal) {
      if (currentRoute.activeModal.length === 0) {
        const { activeModal, ...currentRouteWithoutModal } = currentRoute;
        return [...routeStack.slice(0, -1), currentRouteWithoutModal];
      }
      return removeEmptyModalStack(currentRoute.activeModal);
    }
  }
  return routeStack;
};

const updateTopmostRoute = (baseRouteStack: AppRoutes[], newRoute, replace: boolean): AppRoutes[] => {
  if (baseRouteStack?.length) {
    const currentRoute = baseRouteStack[baseRouteStack.length - 1];
    if (isRouteWithModalSupport(currentRoute) && currentRoute.activeModal) {
      return [
        ...baseRouteStack.slice(0, -1),
        { ...currentRoute, activeModal: updateTopmostRoute(currentRoute.activeModal, newRoute, replace) },
      ];
    }
  }
  if (replace && baseRouteStack?.length) {
    return [...baseRouteStack.slice(0, -1), newRoute];
  }
  return [...(baseRouteStack ?? []), newRoute];
};

const popTopmostRoute = (baseRouteStack: AppRoutes[]): AppRoutes[] => {
  if (baseRouteStack?.length) {
    const currentRoute = baseRouteStack[baseRouteStack.length - 1];
    if (isRouteWithModalSupport(currentRoute) && currentRoute.activeModal) {
      return [
        ...baseRouteStack.slice(0, -1),
        { ...currentRoute, activeModal: popTopmostRoute(currentRoute.activeModal) },
      ];
    }
    return baseRouteStack.slice(0, -1);
  }
  return baseRouteStack;
};

const closeTopModal = (routeStack: AppRoutes[], parent?: AppRoutes): AppRoutes[] => {
  if (routeStack?.length) {
    const currentRoute = routeStack[routeStack.length - 1];

    if (!isRouteWithModalSupport(currentRoute) || !currentRoute.activeModal) {
      // This is the top of the modal stack - if it has a parent, return undefined so the caller removes it
      // Otherwise it's the base route, so just return it as is
      return parent ? undefined : routeStack;
    }
    const nextStack = closeTopModal(currentRoute.activeModal, currentRoute);
    if (nextStack) {
      return [...routeStack.slice(0, -1), { ...currentRoute, activeModal: nextStack }];
    }
    // closeTopModal returned undefined, currentRoute's activeModal is the top of the stack and should be removed
    const { activeModal, ...currentRouteWithoutModal } = currentRoute;
    return [...routeStack.slice(0, -1), currentRouteWithoutModal];
  }
  // Empty activeModalStack should be removed, empty base route should be left alone (probably in a bad state though...
  return parent ? undefined : routeStack;
};

const openModalOnTop = (baseRouteStack: AppRoutes[], modalRoute: AppRoutes): AppRoutes[] => {
  if (baseRouteStack?.length) {
    const currentRoute = baseRouteStack[baseRouteStack.length - 1];
    return [
      ...baseRouteStack.slice(0, -1),
      {
        ...currentRoute,
        // Use a spread to prevent creating an activeModal property at all in the negative case
        ...(isRouteWithModalSupport(currentRoute) && currentRoute.activeModal
          ? {
              activeModal: openModalOnTop(currentRoute.activeModal, modalRoute),
            }
          : { activeModal: [modalRoute] }),
      },
    ];
  }
  return baseRouteStack;
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
          [action.taskId]: updateTopmostRoute(state.tasks[action.taskId], action.routing, Boolean(action.replace)),
        },
      };
    }
    case GO_BACK: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: removeEmptyModalStack(popTopmostRoute(state.tasks[action.taskId])),
        },
      };
    }
    case OPEN_MODAL: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: openModalOnTop(state.tasks[action.taskId], action.routing),
        },
      };
    }
    case CLOSE_MODAL: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: closeTopModal(state.tasks[action.taskId]),
        },
      };
    }
    default:
      return state;
  }
}
