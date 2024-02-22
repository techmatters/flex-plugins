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

import { CaseSectionApi } from './sections/api';
import { CaseItemFormValues } from '../../types/types';
import { CaseState, CaseSummaryWorkingCopy } from './types';
import { ConfigurationState } from '../configuration/reducer';
import { transformValues } from '../contacts/contactDetailsAdapter';
import { CaseSectionTypeSpecificData } from '../../services/caseSectionService';

// Update a section of a case's working copy
const UPDATE_CASE_SECTION_WORKING_COPY = 'UPDATE_CASE_SECTION_WORKING_COPY';

type UpdateCaseSectionWorkingCopyAction = {
  type: typeof UPDATE_CASE_SECTION_WORKING_COPY;
  caseId: string;
  api: CaseSectionApi;
  id?: string;
  sectionItem: CaseSectionTypeSpecificData;
};

export const updateCaseSectionWorkingCopy = (
  caseId: string,
  api: CaseSectionApi,
  sectionItem: CaseSectionTypeSpecificData,
  id?: string,
): UpdateCaseSectionWorkingCopyAction => ({
  type: UPDATE_CASE_SECTION_WORKING_COPY,
  caseId,
  api,
  sectionItem,
  id,
});

const updateCaseSectionWorkingCopyReducer = (
  state: CaseState,
  configState: ConfigurationState,
  { sectionItem, caseId, id, api }: UpdateCaseSectionWorkingCopyAction,
): CaseState => {
  const definition =
    configState.definitionVersions[state.cases[caseId].connectedCase.info.definitionVersion] ??
    configState.currentDefinitionVersion;
  const transformedSectionItem: CaseSectionTypeSpecificData = transformValues(api.getSectionFormDefinition(definition))(
    sectionItem,
  );
  return {
    ...state,
    cases: {
      ...state.cases,
      [caseId]: {
        ...state.cases[caseId],
        caseWorkingCopy: api.updateWorkingCopy(state.cases[caseId]?.caseWorkingCopy, transformedSectionItem, id),
      },
    },
  };
};

// Initialise a new section of a case's working copy based on the saved data, or blank if adding a new section
const INIT_EXISTING_CASE_SECTION_WORKING_COPY = 'INIT_EXISTING_CASE_SECTION_WORKING_COPY';

type InitialiseExistingCaseSectionWorkingCopyAction = {
  type: typeof INIT_EXISTING_CASE_SECTION_WORKING_COPY;
  caseId: string;
  api: CaseSectionApi;
  id: string;
};

export const initialiseExistingCaseSectionWorkingCopy = (
  caseId: string,
  api: CaseSectionApi,
  id: string,
): InitialiseExistingCaseSectionWorkingCopyAction => ({
  type: INIT_EXISTING_CASE_SECTION_WORKING_COPY,
  caseId,
  api,
  id,
});

const initialiseCaseSectionWorkingCopyReducer = (
  state: CaseState,
  action: InitialiseExistingCaseSectionWorkingCopyAction,
): CaseState => {
  const { sectionTypeSpecificData } = action.api.getSectionItemById(
    state.cases[action.caseId].connectedCase,
    action.id,
  );
  return {
    ...state,
    cases: {
      ...state.cases,
      [action.caseId]: {
        ...state.cases[action.caseId],
        caseWorkingCopy: action.api.updateWorkingCopy(
          state.cases[action.caseId]?.caseWorkingCopy,
          sectionTypeSpecificData,
          action.id,
        ),
      },
    },
  };
};

const INIT_NEW_CASE_SECTION_WORKING_COPY = 'INIT_NEW_CASE_SECTION_WORKING_COPY';

type InitialiseNewCaseSectionWorkingCopyAction = {
  type: typeof INIT_NEW_CASE_SECTION_WORKING_COPY;
  caseId: string;
  api: CaseSectionApi;
  form: CaseItemFormValues;
};

export const initialiseNewCaseSectionWorkingCopy = (
  caseId: string,
  api: CaseSectionApi,
  form: CaseItemFormValues,
): InitialiseNewCaseSectionWorkingCopyAction => ({
  type: INIT_NEW_CASE_SECTION_WORKING_COPY,
  caseId,
  api,
  form,
});

const initialiseNewCaseSectionWorkingCopyReducer = (
  state: CaseState,
  action: InitialiseNewCaseSectionWorkingCopyAction,
): CaseState => {
  return {
    ...state,
    cases: {
      ...state.cases,
      [action.caseId]: {
        ...state.cases[action.caseId],
        caseWorkingCopy: action.api.updateWorkingCopy(state.cases[action.caseId]?.caseWorkingCopy, action.form),
      },
    },
  };
};

// Remove a section's working copy
const REMOVE_CASE_SECTION_WORKING_COPY = 'REMOVE_CASE_SECTION_WORKING_COPY';

type RemoveCaseSectionWorkingCopyAction = {
  type: typeof REMOVE_CASE_SECTION_WORKING_COPY;
  caseId: string;
  api: CaseSectionApi;
  id?: string;
};

export const removeCaseSectionWorkingCopy = (
  caseId: string,
  api: CaseSectionApi,
  id?: string,
): RemoveCaseSectionWorkingCopyAction => ({
  type: REMOVE_CASE_SECTION_WORKING_COPY,
  caseId,
  api,
  id,
});

const removeCaseSectionWorkingCopyReducer = (
  state: CaseState,
  action: RemoveCaseSectionWorkingCopyAction,
): CaseState => {
  const caseWorkingCopy = state.cases[action.caseId]?.caseWorkingCopy;
  if (caseWorkingCopy) {
    return {
      ...state,
      cases: {
        ...state.cases,
        [action.caseId]: {
          ...state.cases[action.caseId],
          caseWorkingCopy: action.api.updateWorkingCopy(caseWorkingCopy, undefined, action.id),
        },
      },
    };
  }
  return state;
};

// Initialise a new section of a case's working copy based on the saved data, or blank if adding a new section
const INIT_CASE_SUMMARY_WORKING_COPY = 'INIT_CASE_SUMMARY_WORKING_COPY';

type InitialiseCaseSummaryWorkingCopyAction = {
  type: typeof INIT_CASE_SUMMARY_WORKING_COPY;
  caseId: string;
  defaults: CaseSummaryWorkingCopy;
};

export const initialiseCaseSummaryWorkingCopy = (
  caseId: string,
  defaults: CaseSummaryWorkingCopy,
): InitialiseCaseSummaryWorkingCopyAction => ({
  type: INIT_CASE_SUMMARY_WORKING_COPY,
  caseId,
  defaults,
});

const initialiseCaseSummaryWorkingCopyReducer = (
  state: CaseState,
  action: InitialiseCaseSummaryWorkingCopyAction,
): CaseState => {
  const caseState = state.cases[action.caseId];
  if (!caseState) return state;
  const { childIsAtRisk, summary, followUpDate } = caseState.connectedCase.info;
  return {
    ...state,
    cases: {
      ...state.cases,
      [action.caseId]: {
        ...caseState,
        caseWorkingCopy: {
          caseSummary: {
            status: caseState.connectedCase.status ?? action.defaults.status,
            summary: summary ?? action.defaults.summary,
            childIsAtRisk: childIsAtRisk ?? action.defaults.childIsAtRisk,
            followUpDate: followUpDate ?? action.defaults.followUpDate,
          },
          ...caseState.caseWorkingCopy,
        },
      },
    },
  };
};

// Update a section of a case's working copy
const UPDATE_CASE_SUMMARY_WORKING_COPY = 'UPDATE_CASE_SUMMARY_WORKING_COPY';

type UpdateCaseSummaryWorkingCopyAction = {
  type: typeof UPDATE_CASE_SUMMARY_WORKING_COPY;
  caseId: string;
  caseSummary: CaseSummaryWorkingCopy;
};

export const updateCaseSummaryWorkingCopy = (
  caseId: string,
  caseSummary: CaseSummaryWorkingCopy,
): UpdateCaseSummaryWorkingCopyAction => ({
  type: UPDATE_CASE_SUMMARY_WORKING_COPY,
  caseId,
  caseSummary,
});

const updateCaseSummaryWorkingCopyReducer = (
  state: CaseState,
  action: UpdateCaseSummaryWorkingCopyAction,
): CaseState => {
  if (!state.cases[action.caseId]) return state;
  return {
    ...state,
    cases: {
      ...state.cases,
      [action.caseId]: {
        ...state.cases[action.caseId],
        caseWorkingCopy: {
          ...state.cases[action.caseId]?.caseWorkingCopy,
          caseSummary: action.caseSummary,
        },
      },
    },
  };
};

// Remove the summary working copy
const REMOVE_CASE_SUMMARY_WORKING_COPY = 'REMOVE_CASE_SUMMARY_WORKING_COPY';

type RemoveCaseSummaryWorkingCopyAction = {
  type: typeof REMOVE_CASE_SUMMARY_WORKING_COPY;
  caseId: string;
};

export const removeCaseSummaryWorkingCopy = (caseId: string): RemoveCaseSummaryWorkingCopyAction => ({
  type: REMOVE_CASE_SUMMARY_WORKING_COPY,
  caseId,
});

const removeCaseSummaryWorkingCopyReducer = (
  state: CaseState,
  action: RemoveCaseSummaryWorkingCopyAction,
): CaseState => {
  if (!state.cases[action.caseId]) return state;
  const { caseSummary, ...caseWorkingCopyWithoutSummary } = state.cases[action.caseId]?.caseWorkingCopy ?? {
    sections: {},
  };
  if (caseWorkingCopyWithoutSummary) {
    return {
      ...state,
      cases: {
        ...state.cases,
        [action.caseId]: {
          ...state.cases[action.caseId],
          caseWorkingCopy: caseWorkingCopyWithoutSummary,
        },
      },
    };
  }
  return state;
};

export type CaseWorkingCopyActionType =
  | RemoveCaseSectionWorkingCopyAction
  | InitialiseExistingCaseSectionWorkingCopyAction
  | InitialiseNewCaseSectionWorkingCopyAction
  | UpdateCaseSectionWorkingCopyAction
  | InitialiseCaseSummaryWorkingCopyAction
  | UpdateCaseSummaryWorkingCopyAction
  | RemoveCaseSummaryWorkingCopyAction;

export const caseWorkingCopyReducer = (
  caseState: CaseState,
  configurationState: ConfigurationState,
  action: CaseWorkingCopyActionType,
): CaseState => {
  switch (action.type) {
    case UPDATE_CASE_SECTION_WORKING_COPY:
      return updateCaseSectionWorkingCopyReducer(caseState, configurationState, action);
    case INIT_EXISTING_CASE_SECTION_WORKING_COPY:
      return initialiseCaseSectionWorkingCopyReducer(caseState, action);
    case INIT_NEW_CASE_SECTION_WORKING_COPY:
      return initialiseNewCaseSectionWorkingCopyReducer(caseState, action);
    case REMOVE_CASE_SECTION_WORKING_COPY:
      return removeCaseSectionWorkingCopyReducer(caseState, action);
    case INIT_CASE_SUMMARY_WORKING_COPY:
      return initialiseCaseSummaryWorkingCopyReducer(caseState, action);
    case UPDATE_CASE_SUMMARY_WORKING_COPY:
      return updateCaseSummaryWorkingCopyReducer(caseState, action);
    case REMOVE_CASE_SUMMARY_WORKING_COPY:
      return removeCaseSummaryWorkingCopyReducer(caseState, action);
    default:
      return caseState;
  }
};
