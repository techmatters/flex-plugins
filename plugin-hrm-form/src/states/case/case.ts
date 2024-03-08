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

import { createAction, createAsyncAction } from 'redux-promise-middleware-actions';

import * as CaseService from '../../services/CaseService';
import * as t from './types';
import { loadCaseIntoState } from './loadCaseIntoState';
import type { Case } from '../../types/types';
import type { HrmState } from '..';
import { dereferenceCase, referenceCase } from './referenceCase';

export const loadCaseAsync = createAsyncAction(
  t.LOAD_CASE_ACTION,
  ({ caseId }) => CaseService.getCase(caseId),
  ({ caseId, referenceId }: { caseId: Case['id']; referenceId: string }) => ({
    caseId,
    referenceId,
  }),
);

export type LoadCaseAsync = typeof loadCaseAsync;

type LoadCaseAyncMeta = { caseId: Case['id']; referenceId: string };

export const handleLoadCasePendingAction = (
  state: HrmState,
  action: ReturnType<LoadCaseAsync['pending']> & { meta?: LoadCaseAyncMeta },
): HrmState => {
  const { caseId, referenceId } = action.meta;

  const cas = state.connectedCase.cases[caseId]?.connectedCase;

  return {
    ...state,
    connectedCase: loadCaseIntoState({
      state: state.connectedCase,
      caseId,
      definitionVersion: state.configuration.currentDefinitionVersion,
      newCase: cas,
      error: null,
      loading: true,
      referenceId,
    }),
  };
};

export const handleLoadCaseFulfilledAction = (
  state: HrmState,
  action: ReturnType<LoadCaseAsync['fulfilled']> & { meta?: LoadCaseAyncMeta },
): HrmState => {
  const { caseId, referenceId } = action.meta;

  const cas = action.payload;

  return {
    ...state,
    connectedCase: loadCaseIntoState({
      state: state.connectedCase,
      caseId,
      definitionVersion: state.configuration.currentDefinitionVersion,
      newCase: cas,
      error: null,
      loading: false,
      referenceId,
    }),
  };
};

export const handleLoadCaseRejectedAction = (
  state: HrmState,
  action: ReturnType<LoadCaseAsync['rejected']> & { meta?: LoadCaseAyncMeta },
): HrmState => {
  const { caseId, referenceId } = action.meta;

  const cas = state.connectedCase.cases[caseId]?.connectedCase;

  return {
    ...state,
    connectedCase: loadCaseIntoState({
      state: state.connectedCase,
      caseId,
      definitionVersion: state.configuration.currentDefinitionVersion,
      newCase: cas,
      error: action.payload,
      loading: false,
      referenceId,
    }),
  };
};

export const referenceCaseAction = createAction(
  t.REFERENCE_CASE_ACTION,
  ({ caseId, referenceId }: { caseId: Case['id']; referenceId: string }) => ({
    caseId,
    referenceId,
  }),
);

export type ReferenceCaseAction = ReturnType<typeof referenceCaseAction>;

export const handleReferenceCaseAction = (state: HrmState, action: ReferenceCaseAction): HrmState => {
  const { caseId, referenceId } = action.payload;
  const updatedCaseState = referenceCase(state.connectedCase, caseId, referenceId);

  return { ...state, connectedCase: updatedCaseState };
};

export const dereferenceCaseAction = createAction(
  t.DEREFERENCE_CASE_ACTION,
  ({ caseId, referenceId }: { caseId: Case['id']; referenceId: string }) => ({
    caseId,
    referenceId,
  }),
);

export type DereferenceCaseAction = ReturnType<typeof dereferenceCaseAction>;

export const handleDereferenceCaseAction = (state: HrmState, action: DereferenceCaseAction): HrmState => {
  const { caseId, referenceId } = action.payload;
  const updatedCaseState = dereferenceCase(state.connectedCase, caseId, referenceId);

  return { ...state, connectedCase: updatedCaseState };
};
