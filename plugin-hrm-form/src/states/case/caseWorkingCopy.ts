import { v4 as uuidV4 } from 'uuid';

import { CaseSectionApi } from './sections/api';
import { CaseItemEntry } from '../../types/types';
import { CaseState } from './types';

// Update a section of a case's working copy
export const UPDATE_CASE_SECTION_WORKING_COPY = 'UPDATE_CASE_SECTION_WORKING_COPY';

export type UpdateCaseSectionWorkingCopyAction = {
  type: typeof UPDATE_CASE_SECTION_WORKING_COPY;
  taskId: string;
  api: CaseSectionApi<unknown>;
  id?: string;
  sectionItem: CaseItemEntry;
};

export const updateCaseSectionWorkingCopy = (
  taskId: string,
  api: CaseSectionApi<unknown>,
  sectionItem: CaseItemEntry,
  id?: string,
): UpdateCaseSectionWorkingCopyAction => ({
  type: UPDATE_CASE_SECTION_WORKING_COPY,
  taskId,
  api,
  sectionItem,
  id,
});

export const updateCaseSectionWorkingCopyReducer = (
  state: CaseState,
  action: UpdateCaseSectionWorkingCopyAction,
): CaseState => {
  return {
    ...state,
    tasks: {
      ...state.tasks,
      [action.taskId]: {
        ...state.tasks[action.taskId],
        caseWorkingCopy: action.api.updateWorkingCopy(
          state.tasks[action.taskId]?.caseWorkingCopy,
          action.sectionItem,
          action.id,
        ),
      },
    },
  };
};

// Initialise a new section of a case's working copy based on the saved data, or blank if adding a new section
export const INIT_CASE_SECTION_WORKING_COPY = 'INIT_CASE_SECTION_WORKING_COPY';

export type InitialiseCaseSectionWorkingCopyAction = {
  type: typeof INIT_CASE_SECTION_WORKING_COPY;
  taskId: string;
  api: CaseSectionApi<unknown>;
  id?: string;
};

export const initialiseCaseSectionWorkingCopy = (
  taskId: string,
  api: CaseSectionApi<unknown>,
  id?: string,
): InitialiseCaseSectionWorkingCopyAction => ({
  type: INIT_CASE_SECTION_WORKING_COPY,
  taskId,
  api,
  id,
});

export const initialiseCaseSectionWorkingCopyReducer = (
  state: CaseState,
  action: InitialiseCaseSectionWorkingCopyAction,
): CaseState => {
  const item: CaseItemEntry = action.id
    ? action.api.toForm(action.api.getSectionItemById(state.tasks[action.taskId].connectedCase.info, action.id))
    : { id: uuidV4(), form: {}, createdAt: null, twilioWorkerId: null };
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

// Remove a section's working copy
export const REMOVE_CASE_SECTION_WORKING_COPY = 'REMOVE_CASE_SECTION_WORKING_COPY';
export type RemoveCaseSectionWorkingCopyAction = {
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
