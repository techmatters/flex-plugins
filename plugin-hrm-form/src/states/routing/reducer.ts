import { omit } from 'lodash';

import { AppRoutes, RoutingActionType, CHANGE_ROUTE } from './types';
import { GeneralActionType, INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE } from '../types';
import { standaloneTaskSid } from '../../components/StandaloneSearch';
import { offlineContactTaskSid } from '../../types/types';

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

export function reduce(state = initialState, action: RoutingActionType | GeneralActionType): RoutingState {
  switch (action.type) {
    case INITIALIZE_CONTACT_STATE: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
        isAddingOfflineContact: action.taskId === offlineContactTaskSid ? true : state.isAddingOfflineContact,
      };
    }
    case RECREATE_CONTACT_STATE: {
      if (state.tasks[action.taskId]) return state;

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
        isAddingOfflineContact: action.taskId === offlineContactTaskSid ? true : state.isAddingOfflineContact,
      };
    }
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
        isAddingOfflineContact: action.taskId === offlineContactTaskSid ? false : state.isAddingOfflineContact,
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
