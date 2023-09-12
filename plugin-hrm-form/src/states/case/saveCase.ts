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
  async (caseId: Case['id'], taskSid: string, body: Partial<Case>): Promise<{ taskSid: string; case: Case }> => {
    return { taskSid, case: await updateCase(caseId, body) };
  },
);

// In order to use the createReducer helper, we need to combine the case state and the root state into a single object
// Perhaps we should just pass the root state to simplify things?
type UpdateCaseReducerState = { state: CaseState; rootState: RootState['plugin-hrm-form'] };

export const updateCaseReducer = (initialState: UpdateCaseReducerState) =>
  // We need to return a state object of the same type as we are passed, so we need to return the rootState even though we don't change it.
  createReducer(initialState, handleAction => [
    handleAction(updateCaseAsyncAction.pending as typeof updateCaseAsyncAction, ({ state, rootState }) => {
      return {
        state: {
          ...state,
          status: SavedCaseStatus.ResultPending,
        },
        rootState,
      };
    }),

    handleAction(
      updateCaseAsyncAction.fulfilled,
      ({ state, rootState }, { payload: { case: connectedCase, taskSid } }): UpdateCaseReducerState => {
        if (!state.tasks[taskSid]) return { state, rootState };
        const caseDefinitionVersion =
          rootState[configurationBase].definitionVersions[connectedCase?.info?.definitionVersion];
        return {
          state: {
            // status: SavedCaseStatus.ResultReceived,
            ...state,
            tasks: {
              ...state.tasks,
              [taskSid]: {
                connectedCase,
                caseWorkingCopy: { sections: {} },
                availableStatusTransitions: caseDefinitionVersion
                  ? getAvailableCaseStatusTransitions(connectedCase, caseDefinitionVersion)
                  : [],
              },
            },
          },
          rootState,
        };
      },
    ),

    handleAction(updateCaseAsyncAction.rejected, ({ state, rootState }, { payload }) => {
      return {
        state: {
          ...state,
          status: SavedCaseStatus.ResultReceived,
          error: payload,
        },
        rootState,
      };
    }),
  ]);

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
