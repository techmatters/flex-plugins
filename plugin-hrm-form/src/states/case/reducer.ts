import { omit } from 'lodash';

import { CaseActionType, CaseState, REMOVE_CONNECTED_CASE, SET_CONNECTED_CASE } from './types';
import { GeneralActionType, REMOVE_CONTACT_STATE } from '../types';
import {
  CaseWorkingCopyActionType,
  INIT_EXISTING_CASE_SECTION_WORKING_COPY,
  INIT_NEW_CASE_SECTION_WORKING_COPY,
  INIT_CASE_SUMMARY_WORKING_COPY,
  initialiseCaseSectionWorkingCopyReducer,
  initialiseNewCaseSectionWorkingCopyReducer,
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
import { configurationBase, RootState } from '..';
import { getAvailableCaseStatusTransitions } from './caseStatus';

const initialState: CaseState = {
  tasks: {},
};

// eslint-disable-next-line import/no-unused-modules
export function reduce(
  rootState: RootState['plugin-hrm-form'],
  state = initialState,
  action: CaseActionType | CaseWorkingCopyActionType | GeneralActionType,
): CaseState {
  switch (action.type) {
    case SET_CONNECTED_CASE:
      const caseDefinitionVersion =
        rootState[configurationBase].definitionVersions[action.connectedCase?.info?.definitionVersion];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: {
            connectedCase: action.connectedCase,
            caseWorkingCopy: { sections: {} },
            availableStatusTransitions: caseDefinitionVersion
              ? getAvailableCaseStatusTransitions(action.connectedCase, caseDefinitionVersion)
              : [],
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
    case UPDATE_CASE_SECTION_WORKING_COPY:
      return updateCaseSectionWorkingCopyReducer(state, action);
    case INIT_EXISTING_CASE_SECTION_WORKING_COPY:
      return initialiseCaseSectionWorkingCopyReducer(state, action);
    case INIT_NEW_CASE_SECTION_WORKING_COPY:
      return initialiseNewCaseSectionWorkingCopyReducer(state, action);
    case REMOVE_CASE_SECTION_WORKING_COPY:
      return removeCaseSectionWorkingCopyReducer(state, action);
    case INIT_CASE_SUMMARY_WORKING_COPY:
      return initialiseCaseSummaryWorkingCopyReducer(state, action);
    case UPDATE_CASE_SUMMARY_WORKING_COPY:
      return updateCaseSummaryWorkingCopyReducer(state, action);
    case REMOVE_CASE_SUMMARY_WORKING_COPY:
      return removeCaseSummaryWorkingCopyReducer(state, action);
    default:
      return state;
  }
}
