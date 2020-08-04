import { omit } from 'lodash';

import { INITIALIZE_CONTACT_STATE, REMOVE_CONTACT_STATE, RECREATE_SEARCH_CONTACT } from '../ActionTypes';
import { AppRoutes, RoutingActionType, CHANGE_ROUTE } from './types';

export type RoutingState = {
  tasks: {
    [taskId: string]: AppRoutes;
  };
};

const initialState: RoutingState = {
  tasks: {},
};

const newTaskEntry = {
  route: 'select-call-type',
};

export function reduce(state = initialState, action: RoutingActionType) {
  switch (action.type) {
    // @ts-ignore TODO: maybe we need a "common" action for this, that triggers this in all of the reducers
    case INITIALIZE_CONTACT_STATE: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
      };
    }
    // @ts-ignore TODO: maybe we need a "common" action for this, that triggers this in all of the reducers
    case RECREATE_SEARCH_CONTACT:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: newTaskEntry,
        },
      };
    // @ts-ignore TODO: maybe we need a "common" action for this, that triggers this in all of the reducers
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
    default:
      return state;
  }
}
