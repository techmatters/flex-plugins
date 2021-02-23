import { omit } from 'lodash';

import { AppRoutes, RoutingActionType, CHANGE_ROUTE, ADD_OFFLINE_CONTACT } from './types';
import { GeneralActionType, INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE, REMOVE_CONTACT_STATE } from '../types';
import { standaloneTaskSid } from '../../components/StandaloneSearch';

export type RoutingState = {
  tasks: {
    [taskId: string]: AppRoutes;
  };
  addOfflineContact: boolean;
};

const newTaskEntry = {
  route: 'select-call-type' as const,
};

export const initialState: RoutingState = {
  tasks: {
    [standaloneTaskSid]: newTaskEntry,
  },
  addOfflineContact: false,
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
      };
    }
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
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
    case ADD_OFFLINE_CONTACT:
      return {
        ...state,
        addOfflineContact: true,
      };
    default:
      return state;
  }
}
