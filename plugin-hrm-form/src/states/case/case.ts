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

import { createAsyncAction } from 'redux-promise-middleware-actions';

import * as CaseService from '../../services/CaseService';
import * as t from './types';
import { loadCaseIntoState } from './loadCaseIntoState';
import type { Case } from '../../types/types';
import type { HrmState } from '..';

export const loadCaseAsync = createAsyncAction(t.LOAD_CASE_ACTION, CaseService.getCase, (caseId: Case['id']) => ({
  caseId,
}));

export type LoadCaseAsync = typeof loadCaseAsync;

type LoadCaseAyncMeta = { caseId: Case['id'] };

export const handleLoadCasePendingAction = (
  state: HrmState,
  action: ReturnType<LoadCaseAsync['pending']> & { meta?: LoadCaseAyncMeta },
): HrmState => {
  const { caseId } = action.meta;

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
    }),
  };
};

export const handleLoadCaseFulfilledAction = (
  state: HrmState,
  action: ReturnType<LoadCaseAsync['fulfilled']> & { meta?: LoadCaseAyncMeta },
): HrmState => {
  const { caseId } = action.meta;

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
    }),
  };
};

export const handleLoadCaseRejectedAction = (
  state: HrmState,
  action: ReturnType<LoadCaseAsync['rejected']> & { meta?: LoadCaseAyncMeta },
): HrmState => {
  const { caseId } = action.meta;

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
    }),
  };
};
