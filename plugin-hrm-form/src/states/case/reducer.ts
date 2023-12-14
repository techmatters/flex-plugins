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

import { CaseActionType, CaseState } from './types';
import { DefinitionVersion, REMOVE_CONTACT_STATE, RemoveContactStateAction } from '../types';
import { CaseWorkingCopyActionType, caseWorkingCopyReducer } from './caseWorkingCopy';
import { HrmState, RootState } from '..';
import { getAvailableCaseStatusTransitions } from './caseStatus';
import { saveCaseReducer } from './saveCase';
import { FETCH_CASE_LIST_FULFILLED_ACTION, FetchCaseListFulfilledAction } from '../caseList/listContent';
import {
  ContactUpdatingAction,
  CREATE_CONTACT_ACTION_FULFILLED,
  LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED,
} from '../contacts/types';
import { SEARCH_CASES_SUCCESS, SearchCasesSuccessAction } from '../search/types';
import { Case } from '../../types/types';
import { ConfigurationState } from '../configuration/reducer';

const initialState: CaseState = {
  cases: {},
};

const boundSaveCaseReducer = saveCaseReducer({ connectedCase: initialState } as RootState['plugin-hrm-form']);

const dereferenceCase = (state: CaseState, caseId: string, referenceId: string): CaseState => {
  const caseState = state.cases[caseId];
  if (!caseState) {
    return state;
  }
  const references = caseState.references ?? new Set<string>();
  references.delete(referenceId);
  if (references.size === 0) {
    return {
      ...state,
      cases: omit(state.cases, caseId),
    };
  }
  return {
    ...state,
    cases: {
      ...state.cases,
      [caseId]: {
        ...state.cases[caseId],
        references,
      },
    },
  };
};

const dereferenceAllCases = (state: CaseState, referenceId: string): CaseState => {
  const { cases } = state;
  const caseIds = Object.keys(cases);
  if (caseIds.length === 0) {
    return state;
  }
  const updatedCases = caseIds.reduce((acc, caseId) => {
    const updatedCase = dereferenceCase(state, caseId, referenceId);
    if (updatedCase.cases[caseId]) {
      acc[caseId] = updatedCase.cases[caseId];
    }
    return acc;
  }, {} as CaseState['cases']);
  return {
    ...state,
    cases: updatedCases,
  };
};

const loadCaseIntoState = (
  state: CaseState,
  definitionVersion: DefinitionVersion,
  newCase: Case,
  referenceId?: string,
): CaseState => {
  const existingCase = state.cases[newCase.id];
  if (!existingCase) {
    return {
      ...state,
      cases: {
        ...state.cases,
        [newCase.id]: {
          connectedCase: newCase,
          caseWorkingCopy: { sections: {} },
          availableStatusTransitions: getAvailableCaseStatusTransitions(newCase, definitionVersion),
          references: referenceId ? new Set([referenceId]) : new Set<string>(),
        },
      },
    };
  }

  const updatedReferences = referenceId ? existingCase.references.add(referenceId) : existingCase.references;
  return {
    ...state,
    cases: {
      ...state.cases,
      [newCase.id]: {
        ...existingCase,
        references: updatedReferences,
        connectedCase: newCase,
      },
    },
  };
};

const contactUpdatingReducer = (hrmState: HrmState, action: ContactUpdatingAction): HrmState => {
  if (
    action.type === CREATE_CONTACT_ACTION_FULFILLED ||
    action.type === LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED
  ) {
    const { configuration, connectedCase } = hrmState;
    const { contact, contactCase } = action.payload;
    if (contactCase) {
      const caseDefinitionVersion = configuration.definitionVersions[contactCase.info.definitionVersion];
      const references = connectedCase.cases[contactCase.id]?.references ?? new Set<string>();
      references.add(`contact-${contact.id}`);
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
              references,
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
  referenceId: string,
): CaseState => {
  const withoutOldSearchResults = dereferenceAllCases(casesState, referenceId);
  if (cases?.length) {
    return cases.reduce((acc, newCase) => {
      // TODO: strip the totalCount property in HRM
      const { totalCount, ...caseToAdd } = newCase as Case & { totalCount: number };
      const caseDefinitionVersion = configurationState.definitionVersions[newCase.info.definitionVersion];
      return loadCaseIntoState(acc, caseDefinitionVersion, caseToAdd, referenceId);
    }, withoutOldSearchResults);
  }
  return withoutOldSearchResults;
};

// eslint-disable-next-line import/no-unused-modules
export function reduce(
  inputRootState: HrmState,
  action:
    | CaseActionType
    | CaseWorkingCopyActionType
    | RemoveContactStateAction
    | ContactUpdatingAction
    | SearchCasesSuccessAction
    | FetchCaseListFulfilledAction,
): HrmState {
  let hrmState = boundSaveCaseReducer(inputRootState, action as any);
  hrmState = {
    ...hrmState,
    connectedCase: caseWorkingCopyReducer(
      hrmState.connectedCase,
      hrmState.configuration,
      action as CaseWorkingCopyActionType,
    ),
  };
  const { connectedCase: state, configuration } = hrmState;
  switch (action.type) {
    case CREATE_CONTACT_ACTION_FULFILLED:
    case LOAD_CONTACT_FROM_HRM_BY_TASK_ID_ACTION_FULFILLED:
      return contactUpdatingReducer(hrmState, action as ContactUpdatingAction);

    case REMOVE_CONTACT_STATE: {
      const { contactId, taskId } = action as RemoveContactStateAction;
      const contactReferenceRemoved = dereferenceAllCases(state, `contact-${contactId}`);
      return { ...hrmState, connectedCase: dereferenceAllCases(contactReferenceRemoved, `task-${taskId}`) };
    }
    case FETCH_CASE_LIST_FULFILLED_ACTION:
      const {
        payload: {
          result: { cases },
        },
      } = action as FetchCaseListFulfilledAction;
      return {
        ...hrmState,
        connectedCase: loadCaseListIntoState(state, configuration, cases, `case-list`),
      };
    case SEARCH_CASES_SUCCESS: {
      const { searchResult, taskId } = action as SearchCasesSuccessAction;
      const referenceId = `search-${taskId}`;
      return {
        ...hrmState,
        connectedCase: loadCaseListIntoState(state, configuration, searchResult?.cases, referenceId),
      };
    }
    default:
      return hrmState;
  }
}
