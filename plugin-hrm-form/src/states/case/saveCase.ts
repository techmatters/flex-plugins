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
import { CreateHandlerMap } from 'redux-promise-middleware-actions/lib/reducers';

import { createCase, updateCase } from '../../services/CaseService';
import { Case } from '../../types/types';
import { UPDATE_CASE_ACTION, CREATE_CASE_ACTION } from './types';
import type { HrmState } from '..';
import { getAvailableCaseStatusTransitions } from './caseStatus';
import { connectToCase } from '../../services/ContactService';
import { connectToCaseAsyncAction } from '../contacts/saveContact';
import { namespace } from '../storeNamespaces';

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

// We need to return a state object of the same type as we are passed, so we need to return the rootState even though we don't change it.
const handlePendingAction = (handleAction, asyncAction) =>
  handleAction(asyncAction as typeof asyncAction, rootState => {
    return rootState;
  });

const updateConnectedCase = (state: HrmState, connectedCase: Case) => {
  const caseDefinitionVersion =
    state[namespace].configuration.definitionVersions[connectedCase?.info?.definitionVersion];

  return {
    ...state,
    connectedCase: {
      ...state[namespace].connectedCase,
      cases: {
        ...state[namespace].connectedCase.cases,
        [connectedCase.id.toString()]: {
          connectedCase,
          caseWorkingCopy: { sections: {} },
          availableStatusTransitions: caseDefinitionVersion
            ? getAvailableCaseStatusTransitions(connectedCase, caseDefinitionVersion)
            : [],
        },
      },
    },
  };
};

const handleFulfilledAction = (
  handleAction: CreateHandlerMap<HrmState>,
  asyncAction: typeof updateCaseAsyncAction.fulfilled | typeof createCaseAsyncAction.fulfilled,
) =>
  handleAction(
    asyncAction,
    (state, { payload: { case: connectedCase, taskSid } }): HrmState => updateConnectedCase(state, connectedCase),
  );

const handleConnectToCaseFulfilledAction = (
  handleAction: CreateHandlerMap<HrmState>,
  asyncAction: typeof connectToCaseAsyncAction.fulfilled,
) =>
  handleAction(asyncAction, (state, { payload: { contact, contactCase } }) => updateConnectedCase(state, contactCase));

const handleRejectedAction = (
  handleAction: CreateHandlerMap<HrmState>,
  asyncAction: typeof updateCaseAsyncAction.rejected | typeof createCaseAsyncAction.rejected,
) =>
  handleAction(asyncAction, (state, { payload }) => {
    return state;
  });

export const saveCaseReducer = (initialState: HrmState): ((state: HrmState, action) => HrmState) =>
  createReducer(initialState, handleAction => [
    handlePendingAction(handleAction, updateCaseAsyncAction.pending),
    handleFulfilledAction(handleAction, updateCaseAsyncAction.fulfilled),
    handleRejectedAction(handleAction, updateCaseAsyncAction.rejected),

    handlePendingAction(handleAction, createCaseAsyncAction.pending),
    handleFulfilledAction(handleAction, createCaseAsyncAction.fulfilled),
    handleRejectedAction(handleAction, createCaseAsyncAction.rejected),

    handleConnectToCaseFulfilledAction(handleAction, connectToCaseAsyncAction.fulfilled),
  ]);
