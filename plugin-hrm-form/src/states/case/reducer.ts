import { omit } from 'lodash';

import { REMOVE_CONTACT_STATE } from '../ActionTypes';
import { Case } from '../../types/types';
import { CaseActionType, REMOVE_CONNECTED_CASE, SET_CONNECTED_CASE, UPDATE_CASE_INFO, UPDATE_TEMP_INFO } from './types';

export type CaseState = {
  tasks: {
    [taskId: string]: { connectedCase: Case; temporaryCaseInfo: string };
  };
};

const initialState: CaseState = {
  tasks: {},
};

export function reduce(state = initialState, action: CaseActionType) {
  switch (action.type) {
    case SET_CONNECTED_CASE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            connectedCase: action.connectedCase,
            temporaryCaseInfo: '',
          },
        },
      };
    // @ts-ignore TODO: maybe we need a "common" action for this, that triggers this in all of the reducers
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        // @ts-ignore
        tasks: omit(state.tasks, action.taskId),
      };
    // case REMOVE_CONNECTED_CASE:
    case UPDATE_CASE_INFO: {
      const { connectedCase } = state.tasks[action.taskId];
      const updatedCase = { ...connectedCase, info: action.info };
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            connectedCase: updatedCase,
            temporaryCaseInfo: '',
          },
        },
      };
    }
    case UPDATE_TEMP_INFO:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            temporaryCaseInfo: action.string,
          },
        },
      };
    default:
      return state;
  }
}
