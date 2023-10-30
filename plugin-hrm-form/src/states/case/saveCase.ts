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
import { Case } from '../../types/types';
import { UPDATE_CASE_ACTION, CREATE_CASE_ACTION, SavedCaseStatus, CaseState } from './types';
import type { RootState } from '..';
import { getAvailableCaseStatusTransitions } from './caseStatus';
import { connectToCase } from '../../services/ContactService';

export const createCaseAsyncAction = createAsyncAction(
  CREATE_CASE_ACTION,
  async (
    contact,
    taskSid: string,
    workerSid: string,
    definitionVersion: DefinitionVersionId,
  ): Promise<{ taskSid: string; case: Case }> => {
    // We should probably update the case POST endpoint to accept a connected contact to simplify this and avoid extra calls and inconsistent state
    const newCase = await createCase(contact, workerSid, definitionVersion);
    const updatedContact = await connectToCase(contact.id, newCase.id);
    return { taskSid, case: { ...newCase, connectedContacts: [...(newCase.connectedContacts ?? []), updatedContact] } };
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
export type SaveCaseReducerState = {
  state: CaseState;
  rootState: RootState['plugin-hrm-form'];
};

// We need to return a state object of the same type as we are passed, so we need to return the rootState even though we don't change it.
const handlePendingAction = (handleAction, asyncAction) =>
  handleAction(asyncAction as typeof asyncAction, ({ state, rootState }) => {
    return {
      state: {
        ...state,
      },
      rootState,
      status: SavedCaseStatus.ResultReceived,
    };
  });

const handleFulfilledAction = (handleAction, asyncAction) =>
  handleAction(
    asyncAction,
    ({ state, rootState }, { payload: { case: connectedCase, taskSid } }): SaveCaseReducerState => {
      const caseDefinitionVersion = (rootState as RootState['plugin-hrm-form']).configuration.definitionVersions[
        connectedCase?.info?.definitionVersion
      ];
      return {
        state: {
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
  );

const handleRejectedAction = (handleAction, asyncAction) =>
  handleAction(asyncAction, ({ state, rootState }, { payload }) => {
    return {
      state: {
        ...state,
      },
      rootState,
      error: payload,
      status: SavedCaseStatus.ResultReceived,
    };
  });

export const saveCaseReducer = (initialState: SaveCaseReducerState) =>
  createReducer(initialState, handleAction => [
    handlePendingAction(handleAction, updateCaseAsyncAction.pending),
    handleFulfilledAction(handleAction, updateCaseAsyncAction.fulfilled),
    handleRejectedAction(handleAction, updateCaseAsyncAction.rejected),

    handlePendingAction(handleAction, createCaseAsyncAction.pending),
    handleFulfilledAction(handleAction, createCaseAsyncAction.fulfilled),
    handleRejectedAction(handleAction, createCaseAsyncAction.rejected),
  ]);
