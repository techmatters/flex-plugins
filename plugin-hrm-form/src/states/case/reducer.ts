import { omit } from 'lodash';

import {
  CaseActionType,
  CaseState,
  REMOVE_CONNECTED_CASE,
  SET_CONNECTED_CASE,
  UPDATE_CASE_CONTACT,
  UPDATE_CASE_INFO,
  UPDATE_CASE_STATUS,
  UPDATE_TEMP_INFO,
} from './types';
import { GeneralActionType, REMOVE_CONTACT_STATE } from '../types';
import {
  CaseWorkingCopyActionType,
  INIT_CASE_SECTION_WORKING_COPY,
  INIT_CASE_SUMMARY_WORKING_COPY,
  initialiseCaseSectionWorkingCopyReducer,
  initialiseCaseSummaryWorkingCopyReducer,
  REMOVE_CASE_SECTION_WORKING_COPY,
  REMOVE_CASE_SUMMARY_WORKING_COPY,
  removeCaseSectionWorkingCopyReducer,
  removeCaseSummaryWorkingCopyReducer,
  UPDATE_CASE_SECTION_WORKING_COPY,
  UPDATE_CASE_SUMMARY_WORKING_COPY,
  updateCaseSectionWorkingCopyReducer,
  updateCaseSummaryWorkingCopyReducer,
} from './caseWorkingCopy';

const initialState: CaseState = {
  tasks: {},
};

// eslint-disable-next-line import/no-unused-modules
export function reduce(
  state = initialState,
  action: CaseActionType | CaseWorkingCopyActionType | GeneralActionType,
): CaseState {
  switch (action.type) {
    case SET_CONNECTED_CASE:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            connectedCase: action.connectedCase,
            temporaryCaseInfo: null,
            prevStatus: action.connectedCase.status,
            caseWorkingCopy: { sections: {} },
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
          },
        },
      };
    case UPDATE_CASE_SECTION_WORKING_COPY:
      return updateCaseSectionWorkingCopyReducer(state, action);
    case INIT_CASE_SECTION_WORKING_COPY:
      return initialiseCaseSectionWorkingCopyReducer(state, action);
    case REMOVE_CASE_SECTION_WORKING_COPY:
      return removeCaseSectionWorkingCopyReducer(state, action);
    case INIT_CASE_SUMMARY_WORKING_COPY:
      return initialiseCaseSummaryWorkingCopyReducer(state, action);
    case UPDATE_CASE_SUMMARY_WORKING_COPY:
      return updateCaseSummaryWorkingCopyReducer(state, action);
    case REMOVE_CASE_SUMMARY_WORKING_COPY:
      return removeCaseSummaryWorkingCopyReducer(state, action);
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
          },
        },
      };
    case UPDATE_CASE_CONTACT:
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            ...state.tasks[action.taskId],
            connectedCase: {
              ...state.tasks[action.taskId].connectedCase,
              connectedContacts: (state.tasks[action.taskId].connectedCase.connectedContacts ?? []).map(cc =>
                cc.id === action.contact.id ? action.contact : cc,
              ),
            },
          },
        },
      };
    default:
      return state;
  }
}
