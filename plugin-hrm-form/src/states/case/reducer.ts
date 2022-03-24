import { omit } from 'lodash';

import { Case } from '../../types/types';
import {
  CaseActionType,
  TemporaryCaseInfo,
  SET_CONNECTED_CASE,
  REMOVE_CONNECTED_CASE,
  UPDATE_CASE_INFO,
  UPDATE_TEMP_INFO,
  UPDATE_CASE_STATUS,
  MARK_CASE_AS_UPDATED,
  MARK_TEMP_CASE_AS_UPDATED,
} from './types';
import { GeneralActionType, REMOVE_CONTACT_STATE } from '../types';

export type CaseState = {
  tasks: {
    [taskId: string]: {
      connectedCase: Case;
      temporaryCaseInfo?: TemporaryCaseInfo;
      caseHasBeenEdited: Boolean;
      prevStatus: string; // the status as it comes from the DB (required as it may be locally updated in connectedCase)
      tempInfoHasBeenEdited?: Boolean;
    };
  };
};

const initialState: CaseState = {
  tasks: {},
};

export function reduce(state = initialState, action: CaseActionType | GeneralActionType): CaseState {
  switch (action.type) {
    case SET_CONNECTED_CASE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            connectedCase: action.connectedCase,
            temporaryCaseInfo: null,
            caseHasBeenEdited: action.caseHasBeenEdited,
            prevStatus: action.connectedCase.status,
          },
        },
      };
    case REMOVE_CONNECTED_CASE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    // eslint-disable-next-line sonarjs/no-duplicated-branches
    case REMOVE_CONTACT_STATE:
      return {
        ...state,
        tasks: omit(state.tasks, action.taskId),
      };
    case UPDATE_CASE_INFO: {
      const { connectedCase } = state.tasks[action.taskId];
      const updatedCase = { ...connectedCase, info: action.info };
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            connectedCase: updatedCase,
            temporaryCaseInfo: null,
            caseHasBeenEdited: true,
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
            temporaryCaseInfo: action.value,
            tempInfoHasBeenEdited: false,
          },
        },
      };
    case UPDATE_CASE_STATUS:
      const { connectedCase } = state.tasks[action.taskId];
      const updatedCase = { ...connectedCase, status: action.status };
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            connectedCase: updatedCase,
            caseHasBeenEdited: true,
          },
        },
      };
    case MARK_CASE_AS_UPDATED:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            caseHasBeenEdited: false,
          },
        },
      };
    case MARK_TEMP_CASE_AS_UPDATED:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            tempInfoHasBeenEdited: false,
          },
        },
      };
    default:
      return state;
  }
}
