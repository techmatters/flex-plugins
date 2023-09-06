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
import { UPDATE_CASE_ACTION, CREATE_CASE_ACTION, SavedCaseState, SavedCaseStatus } from './types';

export const initialState: SavedCaseState = {
  case: {
    accountSid: '',
    id: 0,
    status: '',
    helpline: '',
    twilioWorkerId: '',
    info: {},
    categories: {},
    createdAt: '',
    updatedAt: '',
    connectedContacts: [],
  },
  status: SavedCaseStatus.NotSaved,
};

export const createCaseAsyncAction = createAsyncAction(
  CREATE_CASE_ACTION,
  async (contactForm: ContactForm, workerSid: string, definitionVersion: DefinitionVersionId) => {
    const testcases = await createCase(contactForm, workerSid, definitionVersion);

    console.log('testcases here now 33', testcases);

    return { ...(await createCase(contactForm, workerSid, definitionVersion)) };
  },
);

export const updateCaseAsyncAction = createAsyncAction(
  UPDATE_CASE_ACTION,
  async (caseId: Case['id'], body: Partial<Case>) => {
    return { ...(await updateCase(caseId, body)) };
  },
);

export const updateCaseReducer = createReducer(initialState, handleAction => [
  handleAction(updateCaseAsyncAction.pending, state => {
    return {
      ...state,
      case: initialState.case,
      status: SavedCaseStatus.ResultPending,
    };
  }),

  handleAction(updateCaseAsyncAction.fulfilled, (state, { payload }) => {
    return {
      ...state,
      case: {
        ...state.case,
        ...payload,
      },
      status: SavedCaseStatus.ResultReceived,
    };
  }),

  handleAction(updateCaseAsyncAction.rejected, (state, { payload }) => {
    return {
      ...state,
      status: SavedCaseStatus.ResultPending,
      error: payload,
    };
  }),
]);

export const createCaseReducer = createReducer(initialState, handleAction => [
  handleAction(createCaseAsyncAction.pending, state => {
    return {
      ...state,
      case: initialState.case,
      status: SavedCaseStatus.ResultPending,
    };
  }),

  handleAction(updateCaseAsyncAction.fulfilled, (state, { payload }) => {
    console.log('createCase payload is here', payload);
    return {
      ...state,
      case: {
        ...state.case,
        ...payload,
      },
      status: SavedCaseStatus.ResultReceived,
    };
  }),

  handleAction(updateCaseAsyncAction.rejected, (state, { payload }) => {
    return {
      ...state,
      status: SavedCaseStatus.ResultPending,
      error: payload,
    };
  }),
]);
