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

import {
  CaseActionType,
  CaseState,
  CaseStateEntry,
  LOAD_CASE_ACTION_FULFILLED,
  LOAD_CASE_ACTION_PENDING,
  LOAD_CASE_ACTION_REJECTED,
} from './types';
import { REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../types';
import { CaseWorkingCopyActionType, caseWorkingCopyReducer } from './caseWorkingCopy';
import { HrmState } from '..';
import { getAvailableCaseStatusTransitions } from './caseStatus';
import { saveCaseReducer } from './saveCase';
import { FETCH_CASE_LIST_FULFILLED_ACTION, FetchCaseListFulfilledAction } from '../caseList/listContent';
import {
  ContactUpdatingAction,
  CREATE_CONTACT_ACTION_FULFILLED,
  LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED,
} from '../contacts/types';
import type { Case } from '../../types/types';
import type { ConfigurationState } from '../configuration/reducer';
import { caseSectionUpdateReducer } from './sections/caseSectionUpdates';
import { timelineReducer } from './timeline';
import { handleLoadCaseFulfilledAction, handleLoadCasePendingAction, handleLoadCaseRejectedAction } from './singleCase';
import { loadCaseIntoState } from './loadCaseIntoState';
import { SEARCH_CASES_SUCCESS_ACTION, SearchCasesSuccessAction } from '../search/results';
import { isStale, hasNonEmptyValue } from '../staleTimeout';

const initialState: CaseState = {
  cases: {},
};

const boundSaveCaseReducer = saveCaseReducer({ connectedCase: initialState } as HrmState);
const boundCaseSectionUpdateReducer = caseSectionUpdateReducer({
  connectedCase: initialState,
} as HrmState);
const boundTimelineReducer = timelineReducer({ connectedCase: initialState } as HrmState);

const hasCaseDraftUpdates = (caseEntry: Pick<CaseStateEntry, 'caseWorkingCopy'>): boolean => {
  const { caseWorkingCopy } = caseEntry;
  if (!caseWorkingCopy) return false;
  if (hasNonEmptyValue(caseWorkingCopy.caseSummary)) return true;
  return Object.values(caseWorkingCopy.sections ?? {}).some(
    section => hasNonEmptyValue(section.new) || Object.keys(section.existing ?? {}).length > 0,
  );
};

const garbageCollectCases = (state: CaseState): CaseState => {
  const updatedCases = Object.fromEntries(
    Object.entries(state.cases).filter(([, caseEntry]) => {
      if (hasCaseDraftUpdates(caseEntry)) return true;
      return !isStale(caseEntry.lastReferencedDate);
    }),
  );
  return { ...state, cases: updatedCases };
};

const contactUpdatingReducer = (hrmState: HrmState, action: ContactUpdatingAction): HrmState => {
  if (
    action.type === CREATE_CONTACT_ACTION_FULFILLED ||
    action.type === LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED
  ) {
    const { configuration, connectedCase } = hrmState;
    const { contact, contactCase } = action.payload;
    if (contactCase) {
      const caseDefinitionVersion =
        configuration.definitionVersions[contactCase.definitionVersion ?? contactCase.info.definitionVersion];
      return {
        ...hrmState,
        connectedCase: {
          ...connectedCase,
          cases: {
            ...connectedCase.cases,
            [contactCase.id]: {
              connectedCase: contactCase,
              caseWorkingCopy: { sections: {} },
              availableStatusTransitions: getAvailableCaseStatusTransitions(contactCase, caseDefinitionVersion),
              lastReferencedDate: new Date(),
              sections: {},
              timelines: {},
              outstandingUpdateCount: 0,
            },
          },
        },
      };
    }
  }
  return hrmState;
};

const loadCaseListIntoState = (
  casesState: CaseState,
  configurationState: ConfigurationState,
  cases: Case[],
): CaseState => {
  if (cases?.length) {
    return cases.reduce((acc, newCase) => {
      // TODO: strip the totalCount property in HRM
      const { totalCount, ...caseToAdd } = newCase as Case & { totalCount: number };
      const caseDefinitionVersion =
        configurationState.definitionVersions[newCase.definitionVersion ?? newCase.info.definitionVersion];
      return loadCaseIntoState({
        state: acc,
        caseId: newCase.id,
        definitionVersion: caseDefinitionVersion,
        newCase: caseToAdd,
        // Any cases being worked on elsewhere when the list is loaded should have in-progress edits preserved
        preserveWorkingCopy: true,
      });
    }, casesState);
  }
  return casesState;
};

// eslint-disable-next-line import/no-unused-modules
export function reduce(
  inputRootState: HrmState,
  action:
    | CaseActionType
    | CaseWorkingCopyActionType
    | RemoveContactStateAction
    | ContactUpdatingAction
    | FetchCaseListFulfilledAction
    | SearchCasesSuccessAction,
): HrmState {
  let hrmState = boundSaveCaseReducer(inputRootState, action as any);
  hrmState = boundCaseSectionUpdateReducer(hrmState, action);
  hrmState = boundTimelineReducer(hrmState, action);
  hrmState = {
    ...hrmState,
    connectedCase: caseWorkingCopyReducer(
      hrmState.connectedCase,
      hrmState.configuration,
      action as CaseWorkingCopyActionType,
    ),
  };
  const { connectedCase: state, configuration } = hrmState;
  let updatedState: HrmState;
  switch (action.type) {
    case LOAD_CASE_ACTION_PENDING: {
      updatedState = handleLoadCasePendingAction(hrmState, action);
      break;
    }
    case LOAD_CASE_ACTION_FULFILLED: {
      updatedState = handleLoadCaseFulfilledAction(hrmState, action);
      break;
    }
    case LOAD_CASE_ACTION_REJECTED: {
      updatedState = handleLoadCaseRejectedAction(hrmState, action);
      break;
    }
    case CREATE_CONTACT_ACTION_FULFILLED:
    case LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION_FULFILLED: {
      updatedState = contactUpdatingReducer(hrmState, action as ContactUpdatingAction);
      break;
    }
    case REMOVE_CONTACT_STATE: {
      updatedState = hrmState;
      break;
    }
    case FETCH_CASE_LIST_FULFILLED_ACTION: {
      const {
        payload: {
          result: { cases },
        },
      } = action as FetchCaseListFulfilledAction;
      updatedState = {
        ...hrmState,
        connectedCase: loadCaseListIntoState(state, configuration, cases),
      };
      break;
    }
    case SEARCH_CASES_SUCCESS_ACTION: {
      const { searchResult } = action.payload;
      updatedState = {
        ...hrmState,
        connectedCase: loadCaseListIntoState(state, configuration, searchResult?.cases),
      };
      break;
    }
    default:
      updatedState = hrmState;
  }
  return { ...updatedState, connectedCase: garbageCollectCases(updatedState.connectedCase) };
}
