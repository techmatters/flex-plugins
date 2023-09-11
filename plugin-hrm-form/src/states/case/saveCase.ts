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

import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';
import { DefinitionVersionId } from 'hrm-form-definitions';

import { createCase, updateCase } from '../../services/CaseService';
import { TaskEntry as ContactForm } from '../contacts/types';
import { Case } from '../../types/types';
import { UPDATE_CASE_ACTION, CREATE_CASE_ACTION, SavedCaseStatus, CaseState, UpdatedCaseAction } from './types';
import { RootState, configurationBase } from '..';
import { getAvailableCaseStatusTransitions } from './caseStatus';

export const createCaseAsyncAction = createAsyncAction(
  CREATE_CASE_ACTION,
  async (contactForm: ContactForm, workerSid: string, definitionVersion: DefinitionVersionId) => {
    return { ...(await createCase(contactForm, workerSid, definitionVersion)) };
  },
);

export const updateCaseAsyncAction = createAsyncAction(
  UPDATE_CASE_ACTION,
  async (caseId: Case['id'], body: Partial<Case>): Promise<Case> => {
    return updateCase(caseId, body);
  }
);

export const updateCaseReducer = (
  rootState: RootState['plugin-hrm-form'],
  initialState: CaseState,
  taskId: string,
) => createReducer(initialState, handleAction => [
    handleAction(updateCaseAsyncAction.pending as typeof updateCaseAsyncAction, (state) => {
      return {
        ...state,
        tasks: {
          ...state.tasks,
        },
        status: SavedCaseStatus.ResultPending,
      };
    }),

    handleAction(updateCaseAsyncAction.fulfilled, (state, {payload}) => {
      if (!state.tasks[taskId]) return state;
      const caseDefinitionVersion =
        rootState[configurationBase].definitionVersions[payload?.info?.definitionVersion];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: {
            connectedCase: payload,
            caseWorkingCopy: { sections: {} },
            availableStatusTransitions: caseDefinitionVersion
              ? getAvailableCaseStatusTransitions(payload, caseDefinitionVersion)
              : [],
          },
        },
        status: SavedCaseStatus.ResultReceived,
      };
    }),

    handleAction(updateCaseAsyncAction.rejected, (state, {payload}) => {
      return {
        ...state,
        tasks: {      
            ...state.tasks,   
        },
        status: SavedCaseStatus.ResultPending,
        error: payload,
      };
    }),
  ])

// export const createCaseReducer = createReducer(initialState, handleAction => [
//   handleAction(createCaseAsyncAction.pending, state => {
//     return {
//       ...state,
//       case: initialState,
//       status: SavedCaseStatus.ResultPending,
//     };
//   }),

//   handleAction(updateCaseAsyncAction.fulfilled, (state, { payload }) => {
//     console.log('createCase payload is here', payload);
//     return {
//       ...state,
//       connectedCase: {
//         ...payload,
//       },
//       status: SavedCaseStatus.ResultReceived,
//     };
//   }),

//   handleAction(updateCaseAsyncAction.rejected, (state, { payload }) => {
//     return {
//       ...state,
//       status: SavedCaseStatus.ResultPending,
//       error: payload,
//     };
//   }),
// ]);
