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

export const fetchCaseListStartReducer = (
  state: CaseListContentState,
  action: FetchCaseListStartAction,
): CaseListContentState => ({ ...state, listLoading: true });

export const FETCH_CASE_LIST_SUCCESS = 'FETCH_CASE_LIST_SUCCESS';

type FetchCaseListSuccessAction = {
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

export const openCaseDetailsReducer = (
  state: CaseListContentState,
  action: OpenCaseDetailsAction,
): CaseListContentState => ({ ...state, caseDetailsOpen: true });

export const CLOSE_CASE_DETAILS = 'CLOSE_CASE_DETAILS';

type CloseCaseDetailsAction = { type: typeof CLOSE_CASE_DETAILS };

export const closeCaseDetails = (): CloseCaseDetailsAction => ({
  type: CLOSE_CASE_DETAILS,
});

export const closeCaseDetailsReducer = (
  state: CaseListContentState,
  action: CloseCaseDetailsAction,
): CaseListContentState => ({ ...state, caseDetailsOpen: false });

export type CaseListContentStateAction =
  | FetchCaseListStartAction
  | FetchCaseListSuccessAction
  | CaseListFetchErrorAction
  | OpenCaseDetailsAction
  | CloseCaseDetailsAction;
