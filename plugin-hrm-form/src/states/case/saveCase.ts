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

import { cancelCase, createCase, updateCaseOverview, updateCaseStatus } from '../../services/CaseService';
import { Case, CaseOverview, Contact } from '../../types/types';
import { CANCEL_CASE_ACTION, CREATE_CASE_ACTION } from './types';
import type { HrmState } from '..';
import { getAvailableCaseStatusTransitions } from './caseStatus';
import { connectToCase } from '../../services/ContactService';
import { connectToCaseAsyncAction } from '../contacts/saveContact';
import { markCaseAsUpdating } from './markCaseAsUpdating';

const UPDATE_CASE_OVERVIEW_ACTION = 'case-action/update-overview';

export const createCaseAsyncAction = createAsyncAction(
  CREATE_CASE_ACTION,
  async (
    contact,
    workerSid: string,
    definitionVersion: DefinitionVersionId,
  ): Promise<{ newCase: Case; connectedContact: Contact }> => {
    // We should probably update the case POST endpoint to accept a connected contact to simplify this and avoid extra calls and inconsistent state
    const newCase = await createCase(contact, workerSid, definitionVersion);
    await connectToCase(contact.id, newCase.id);
    return {
      newCase,
      connectedContact: contact,
    };
  },
);

export const updateCaseOverviewAsyncAction = createAsyncAction(
  UPDATE_CASE_OVERVIEW_ACTION,
  async (caseId: Case['id'], overview: CaseOverview, status: Case['status']): Promise<Case> => {
    let updatedCase;
    if (Object.keys(overview ?? {}).length) {
      overview.followUpDate = overview.followUpDate || null;
      updatedCase = await updateCaseOverview(caseId, overview);
    }
    if (status) {
      updatedCase = await updateCaseStatus(caseId, status);
    }

    return updatedCase;
  },
  (caseId, overview, status) => ({ caseId, overview, status }),
);

export const cancelCaseAsyncAction = createAsyncAction(
  CANCEL_CASE_ACTION,
  async (caseId: Case['id']): Promise<Case['id']> => {
    await cancelCase(caseId);
    return caseId;
  },
);

// We need to return a state object of the same type as we are passed, so we need to return the rootState even though we don't change it.
const handlePendingAction = <T extends Parameters<CreateHandlerMap<HrmState>>[0]>(
  handleAction: CreateHandlerMap<HrmState>,
  asyncAction: T,
) =>
  handleAction(asyncAction, rootState => {
    return rootState;
  });

const updateConnectedCase = (state: HrmState, connectedCase: Case): HrmState => {
  const caseDefinitionVersion = state.configuration.definitionVersions[connectedCase?.info?.definitionVersion];
  const stateCase = state.connectedCase.cases[connectedCase?.id]?.connectedCase;
  const stateInfo = stateCase?.info;

  return {
    ...state,
    connectedCase: {
      ...state.connectedCase,
      cases: {
        ...state.connectedCase.cases,
        [connectedCase.id]: {
          connectedCase: {
            ...connectedCase,
            ...((stateInfo || connectedCase.info) && {
              info: { ...stateInfo, ...connectedCase.info },
            }),
          },
          caseWorkingCopy: { sections: {} },
          availableStatusTransitions: caseDefinitionVersion
            ? getAvailableCaseStatusTransitions(connectedCase, caseDefinitionVersion)
            : [],
          references: state.connectedCase.cases[connectedCase.id]?.references ?? new Set(),
          sections: state.connectedCase.cases[connectedCase.id]?.sections ?? {},
          timelines: state.connectedCase.cases[connectedCase.id]?.timelines ?? {},
          outstandingUpdateCount: state.connectedCase.cases[connectedCase.id]?.outstandingUpdateCount ?? 0,
        },
      },
    },
  };
};

const handleUpdateCaseOverviewFulfilledAction = (
  handleAction: CreateHandlerMap<HrmState>,
  asyncAction: typeof updateCaseOverviewAsyncAction.fulfilled,
) =>
  handleAction(
    asyncAction,
    (state, { payload }): HrmState => markCaseAsUpdating(updateConnectedCase(state, payload), payload.id, false),
  );

const handleCreateCaseFulfilledAction = (
  handleAction: CreateHandlerMap<HrmState>,
  asyncAction: typeof createCaseAsyncAction.fulfilled,
) => handleAction(asyncAction, (state, { payload }): HrmState => updateConnectedCase(state, payload.newCase));

const handleConnectToCaseFulfilledAction = (
  handleAction: CreateHandlerMap<HrmState>,
  asyncAction: typeof connectToCaseAsyncAction.fulfilled,
) =>
  handleAction(asyncAction, (state, { payload: { contact, contactCase } }) => updateConnectedCase(state, contactCase));

const handleCancelCaseFulfilledAction = (
  handleAction: CreateHandlerMap<HrmState>,
  asyncAction: typeof cancelCaseAsyncAction.fulfilled,
) =>
  handleAction(
    asyncAction,
    (state, { payload }): HrmState => {
      const { [payload]: removed, ...withCancelledCaseRemoved } = state.connectedCase.cases;
      return {
        ...state,
        connectedCase: {
          ...state.connectedCase,
          cases: withCancelledCaseRemoved,
        },
      };
    },
  );

const handleRejectedAction = (
  handleAction: CreateHandlerMap<HrmState>,
  asyncAction: typeof createCaseAsyncAction.rejected,
) =>
  handleAction(asyncAction, (state, { payload }) => {
    return state;
  });

export const saveCaseReducer = (initialState: HrmState): ((state: HrmState, action) => HrmState) =>
  createReducer(initialState, handleAction => [
    handlePendingAction(handleAction, createCaseAsyncAction.pending),
    handleCreateCaseFulfilledAction(handleAction, createCaseAsyncAction.fulfilled),
    handleRejectedAction(handleAction, createCaseAsyncAction.rejected),

    handleAction(updateCaseOverviewAsyncAction.pending, (state, { meta: { caseId } }: any) =>
      markCaseAsUpdating(state, caseId, true),
    ),
    handleUpdateCaseOverviewFulfilledAction(handleAction, updateCaseOverviewAsyncAction.fulfilled),
    handleAction(updateCaseOverviewAsyncAction.rejected, (state, { meta: { caseId } }: any) =>
      markCaseAsUpdating(state, caseId, false),
    ),

    handlePendingAction(handleAction, cancelCaseAsyncAction.pending),
    handleCancelCaseFulfilledAction(handleAction, cancelCaseAsyncAction.fulfilled),
    handleRejectedAction(handleAction, cancelCaseAsyncAction.rejected),

    handleConnectToCaseFulfilledAction(handleAction, connectToCaseAsyncAction.fulfilled),
  ]);
