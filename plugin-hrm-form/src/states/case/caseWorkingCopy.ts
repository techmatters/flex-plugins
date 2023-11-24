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

import { v4 as uuidV4 } from 'uuid';

import { CaseSectionApi } from './sections/api';
import { CaseItemEntry, CaseItemFormValues } from '../../types/types';
import { CaseState, CaseSummaryWorkingCopy } from './types';
import { ConfigurationState } from '../configuration/reducer';
import { transformValues } from '../contacts/contactDetailsAdapter';

// Update a section of a case's working copy
export const UPDATE_CASE_SECTION_WORKING_COPY = 'UPDATE_CASE_SECTION_WORKING_COPY';

type UpdateCaseSectionWorkingCopyAction = {
  type: typeof UPDATE_CASE_SECTION_WORKING_COPY;
  caseId: string;
  api: CaseSectionApi<unknown>;
  id?: string;
  sectionItem: CaseItemEntry;
};

export const updateCaseSectionWorkingCopy = (
  caseId: string,
  api: CaseSectionApi<unknown>,
  sectionItem: CaseItemEntry,
  id?: string,
): UpdateCaseSectionWorkingCopyAction => ({
  type: UPDATE_CASE_SECTION_WORKING_COPY,
  caseId,
  api,
  sectionItem,
  id,
});

export const updateCaseSectionWorkingCopyReducer = (
  state: CaseState,
  configState: ConfigurationState,
  { sectionItem, caseId, id, api }: UpdateCaseSectionWorkingCopyAction,
): CaseState => {
  const definition =
    configState.definitionVersions[state.cases[caseId].connectedCase.info.definitionVersion] ??
    configState.currentDefinitionVersion;
  const transformedSectionItem = {
    ...sectionItem,
    form: transformValues(api.getSectionFormDefinition(definition))(sectionItem.form),
  };
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
export const INIT_EXISTING_CASE_SECTION_WORKING_COPY = 'INIT_EXISTING_CASE_SECTION_WORKING_COPY';

type InitialiseExistingCaseSectionWorkingCopyAction = {
  type: typeof INIT_EXISTING_CASE_SECTION_WORKING_COPY;
  taskId: string;
  api: CaseSectionApi<unknown>;
  id: string;
};

export const initialiseExistingCaseSectionWorkingCopy = (
  taskId: string,
  api: CaseSectionApi<unknown>,
  id: string,
): InitialiseExistingCaseSectionWorkingCopyAction => ({
  type: INIT_EXISTING_CASE_SECTION_WORKING_COPY,
  taskId,
  api,
  id,
});

export const initialiseCaseSectionWorkingCopyReducer = (
  state: CaseState,
  action: InitialiseExistingCaseSectionWorkingCopyAction,
): CaseState => {
  const item: CaseItemEntry = action.api.toForm(
    action.api.getSectionItemById(state.tasks[action.taskId].connectedCase.info, action.id),
  );
  return {
    ...state,
    tasks: {
      ...state.tasks,
      [action.taskId]: {
        ...state.tasks[action.taskId],
        caseWorkingCopy: action.api.updateWorkingCopy(state.tasks[action.taskId]?.caseWorkingCopy, item, action.id),
      },
    },
  };
};

export const INIT_NEW_CASE_SECTION_WORKING_COPY = 'INIT_NEW_CASE_SECTION_WORKING_COPY';

type InitialiseNewCaseSectionWorkingCopyAction = {
  type: typeof INIT_NEW_CASE_SECTION_WORKING_COPY;
  taskId: string;
  api: CaseSectionApi<unknown>;
  form: CaseItemFormValues;
};

export const initialiseNewCaseSectionWorkingCopy = (
  taskId: string,
  api: CaseSectionApi<unknown>,
  form: CaseItemFormValues,
): InitialiseNewCaseSectionWorkingCopyAction => ({
  type: INIT_NEW_CASE_SECTION_WORKING_COPY,
  taskId,
  api,
  form,
});

export const initialiseNewCaseSectionWorkingCopyReducer = (
  state: CaseState,
  action: InitialiseNewCaseSectionWorkingCopyAction,
): CaseState => {
  const item: CaseItemEntry = { id: uuidV4(), form: action.form, createdAt: null, twilioWorkerId: null };
  return {
    ...state,
    tasks: {
      ...state.tasks,
      [action.taskId]: {
        ...state.tasks[action.taskId],
        caseWorkingCopy: action.api.updateWorkingCopy(state.tasks[action.taskId]?.caseWorkingCopy, item),
      },
    },
  };
};

// Remove a section's working copy
export const REMOVE_CASE_SECTION_WORKING_COPY = 'REMOVE_CASE_SECTION_WORKING_COPY';

type RemoveCaseSectionWorkingCopyAction = {
  type: typeof REMOVE_CASE_SECTION_WORKING_COPY;
  taskId: string;
  api: CaseSectionApi<unknown>;
  id?: string;
};

export const removeCaseSectionWorkingCopy = (
  taskId: string,
  api: CaseSectionApi<unknown>,
  id?: string,
): RemoveCaseSectionWorkingCopyAction => ({
  type: REMOVE_CASE_SECTION_WORKING_COPY,
  taskId,
  api,
  id,
});

export const removeCaseSectionWorkingCopyReducer = (
  state: CaseState,
  action: RemoveCaseSectionWorkingCopyAction,
): CaseState => {
  const caseWorkingCopy = state.tasks[action.taskId]?.caseWorkingCopy;
  if (caseWorkingCopy) {
    return {
      ...state,
      tasks: {
        ...state.tasks,
        [action.taskId]: {
          ...state.tasks[action.taskId],
          caseWorkingCopy: action.api.updateWorkingCopy(caseWorkingCopy, undefined, action.id),
        },
      },
    };
  }
  return state;
};

// Initialise a new section of a case's working copy based on the saved data, or blank if adding a new section
export const INIT_CASE_SUMMARY_WORKING_COPY = 'INIT_CASE_SUMMARY_WORKING_COPY';

type InitialiseCaseSummaryWorkingCopyAction = {
  type: typeof INIT_CASE_SUMMARY_WORKING_COPY;
  taskId: string;
  defaults: CaseSummaryWorkingCopy;
};

export const initialiseCaseSummaryWorkingCopy = (
  taskId: string,
  defaults: CaseSummaryWorkingCopy,
): InitialiseCaseSummaryWorkingCopyAction => ({
  type: INIT_CASE_SUMMARY_WORKING_COPY,
  taskId,
  defaults,
});

export const initialiseCaseSummaryWorkingCopyReducer = (
  state: CaseState,
  action: InitialiseCaseSummaryWorkingCopyAction,
): CaseState => {
  const caseState = state.tasks[action.taskId];
  if (!caseState) return state;
  const { childIsAtRisk, summary, followUpDate } = caseState.connectedCase.info;
  return {
    ...state,
    tasks: {
      ...state.tasks,
      [action.taskId]: {
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
export const UPDATE_CASE_SUMMARY_WORKING_COPY = 'UPDATE_CASE_SUMMARY_WORKING_COPY';

type UpdateCaseSummaryWorkingCopyAction = {
  type: typeof UPDATE_CASE_SUMMARY_WORKING_COPY;
  taskId: string;
  caseSummary: CaseSummaryWorkingCopy;
};

export const updateCaseSummaryWorkingCopy = (
  taskId: string,
  caseSummary: CaseSummaryWorkingCopy,
): UpdateCaseSummaryWorkingCopyAction => ({
  type: UPDATE_CASE_SUMMARY_WORKING_COPY,
  taskId,
  caseSummary,
});

export const updateCaseSummaryWorkingCopyReducer = (
  state: CaseState,
  action: UpdateCaseSummaryWorkingCopyAction,
): CaseState => {
  if (!state.tasks[action.taskId]) return state;
  return {
    ...state,
    tasks: {
      ...state.tasks,
      [action.taskId]: {
        ...state.tasks[action.taskId],
        caseWorkingCopy: {
          ...state.tasks[action.taskId]?.caseWorkingCopy,
          caseSummary: action.caseSummary,
        },
      },
    },
  };
};

// Remove the summary working copy
export const REMOVE_CASE_SUMMARY_WORKING_COPY = 'REMOVE_CASE_SUMMARY_WORKING_COPY';

type RemoveCaseSummaryWorkingCopyAction = {
  type: typeof REMOVE_CASE_SUMMARY_WORKING_COPY;
  taskId: string;
};

export const removeCaseSummaryWorkingCopy = (taskId: string): RemoveCaseSummaryWorkingCopyAction => ({
  type: REMOVE_CASE_SUMMARY_WORKING_COPY,
  taskId,
});

export const removeCaseSummaryWorkingCopyReducer = (
  state: CaseState,
  action: RemoveCaseSummaryWorkingCopyAction,
): CaseState => {
  if (!state.tasks[action.taskId]) return state;
  const { caseSummary, ...caseWorkingCopyWithoutSummary } = state.tasks[action.taskId]?.caseWorkingCopy ?? {
    sections: {},
  };
  if (caseWorkingCopyWithoutSummary) {
    return {
      ...state,
      tasks: {
        ...state.tasks,
        [action.taskId]: {
          ...state.tasks[action.taskId],
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
