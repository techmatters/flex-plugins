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

import { Case as CaseType, Case } from '../../types/types';

export type CaseListContentState = {
  listLoading: boolean;
  fetchError: any;
  caseList: Case[];
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

export const FETCH_CASE_LIST_STARTED = 'FETCH_CASE_LIST_STARTED';

type FetchCaseListStartAction = { type: typeof FETCH_CASE_LIST_STARTED };

export const fetchCaseListStarted = (): FetchCaseListStartAction => ({
  type: FETCH_CASE_LIST_STARTED,
});

export const fetchCaseListStartReducer = (state: CaseListContentState): CaseListContentState => ({
  ...state,
  listLoading: true,
});

export const FETCH_CASE_LIST_SUCCESS = 'FETCH_CASE_LIST_SUCCESS';

export type FetchCaseListSuccessAction = {
  type: typeof FETCH_CASE_LIST_SUCCESS;
  payload: { caseList: CaseType[]; caseCount: number };
};

export const fetchCaseListSuccess = (caseList: CaseType[], caseCount: number): FetchCaseListSuccessAction => ({
  type: FETCH_CASE_LIST_SUCCESS,
  payload: { caseList, caseCount },
});

export const fetchCaseListSuccessReducer = (
  state: CaseListContentState,
  action: FetchCaseListSuccessAction,
): CaseListContentState => {
  const { caseList, caseCount } = action.payload;
  return { ...state, caseList, caseCount, listLoading: false, fetchError: undefined };
};

export const FETCH_CASE_LIST_ERROR = 'FETCH_CASE_LIST_ERROR';
type CaseListFetchErrorAction = { type: typeof FETCH_CASE_LIST_ERROR; payload: { error: any } };

export const fetchCaseListError = (error: any): CaseListFetchErrorAction => ({
  type: FETCH_CASE_LIST_ERROR,
  payload: { error },
});

export const fetchCaseListErrorReducer = (
  state: CaseListContentState,
  action: CaseListFetchErrorAction,
): CaseListContentState => ({ ...state, listLoading: false, fetchError: action.payload.error });

export const OPEN_CASE_DETAILS = 'OPEN_CASE_DETAILS';

type OpenCaseDetailsAction = { type: typeof OPEN_CASE_DETAILS };

export const openCaseDetails = (): OpenCaseDetailsAction => ({
  type: OPEN_CASE_DETAILS,
});

export const openCaseDetailsReducer = (state: CaseListContentState): CaseListContentState => ({
  ...state,
  caseDetailsOpen: true,
});

export const CLOSE_CASE_DETAILS = 'CLOSE_CASE_DETAILS';

type CloseCaseDetailsAction = { type: typeof CLOSE_CASE_DETAILS };

export const closeCaseDetails = (): CloseCaseDetailsAction => ({
  type: CLOSE_CASE_DETAILS,
});

export const closeCaseDetailsReducer = (state: CaseListContentState): CaseListContentState => ({
  ...state,
  caseDetailsOpen: false,
});

export type CaseListContentStateAction =
  | FetchCaseListStartAction
  | FetchCaseListSuccessAction
  | CaseListFetchErrorAction
  | OpenCaseDetailsAction
  | CloseCaseDetailsAction;
