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

// State

import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { Case as CaseType, ListCasesQueryParams } from '../../types/types';
import { CaseListSettingsState } from './settings';
import { listCases } from '../../services/CaseService';
import { getCasesMissingVersions } from '../../utils/definitionVersions';
import { dateFilterPayloadFromFilters } from './dateFilters';

export type CaseListContentState = {
  listLoading: boolean;
  fetchError: any;
  caseList: string[];
  caseCount: number;
  caseDetailsOpen: boolean;
};

export const caseListContentInitialState = (): CaseListContentState => ({
  listLoading: true,
  fetchError: null,
  caseList: [],
  caseCount: 0,
  caseDetailsOpen: false,
});

const FETCH_CASE_LIST_ACTION = 'cases/fetch-list';

export const fetchCaseListAsyncAction = createAsyncAction(
  FETCH_CASE_LIST_ACTION,
  async ({ sort, page, filter }: CaseListSettingsState, helpline: string, casesPerPage: number) => {
    const queryParams: ListCasesQueryParams = {
      ...sort,
      offset: page * casesPerPage,
      limit: casesPerPage,
    };
    const listCasesPayload = {
      filters: {
        ...filter,
        ...dateFilterPayloadFromFilters({
          createdAt: filter?.createdAt,
          updatedAt: filter?.updatedAt,
          followUpDate: filter?.followUpDate,
        }),
      },
      helpline,
    };
    const result = await listCases(queryParams, listCasesPayload);

    const missingDefinitions = await getCasesMissingVersions(result.cases);
    return { result, missingDefinitions };
  },
);

export const FETCH_CASE_LIST_FULFILLED_ACTION = `${FETCH_CASE_LIST_ACTION}_FULFILLED` as const;

export type FetchCaseListFulfilledAction = {
  type: typeof FETCH_CASE_LIST_FULFILLED_ACTION;
  payload: {
    result: { cases: CaseType[]; count: number };
    missingDefinitions: Awaited<ReturnType<typeof getCasesMissingVersions>>;
  };
};

export const FETCH_CASE_LIST_REJECTED_ACTION = `${FETCH_CASE_LIST_ACTION}_REJECTED` as const;

export type FetchCaseListRejectedAction = {
  type: typeof FETCH_CASE_LIST_REJECTED_ACTION;
  payload: Error;
};

export const listContentReducer = createReducer(caseListContentInitialState(), handleAction => [
  handleAction(fetchCaseListAsyncAction.pending, (state, action) => {
    return { ...state, listLoading: true };
  }),
  handleAction(fetchCaseListAsyncAction.fulfilled, (state, action) => {
    const { cases, count } = action.payload.result;
    return { ...state, caseList: cases.map(c => c.id), caseCount: count, listLoading: false, fetchError: undefined };
  }),
  handleAction(fetchCaseListAsyncAction.rejected, (state, action) => {
    return { ...state, listLoading: false, fetchError: action.payload };
  }),
]);
