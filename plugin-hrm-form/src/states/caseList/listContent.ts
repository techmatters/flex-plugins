// State
import { Case, ListCasesQueryParams } from '../../types/types';
import { listCases } from '../../services/CaseService';

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

const FETCH_CASE_LIST = 'FETCH_CASE_LIST';
export const fetchCaseList = (
  queryParams: ListCasesQueryParams,
  listCasesPayload: {
    filters: any;
    helpline: any;
  },
) => {
  return {
    type: FETCH_CASE_LIST,
    payload: listCases(queryParams, listCasesPayload),
  };
};

export const FETCH_CASE_LIST_STARTED = `${FETCH_CASE_LIST}_PENDING` as const;

type FetchCaseListStartAction = { type: typeof FETCH_CASE_LIST_STARTED };


export const fetchCaseListStartReducer = (
  state: CaseListContentState,
  action: FetchCaseListStartAction,
): CaseListContentState => ({ ...state, listLoading: true });

export const FETCH_CASE_LIST_SUCCESS = `${FETCH_CASE_LIST}_FULFILLED` as const;

type FetchCaseListSuccessAction = {
  type: typeof FETCH_CASE_LIST_SUCCESS;
  payload: Awaited<ReturnType<typeof listCases>>;
};

export const fetchCaseListSuccessReducer = (
  state: CaseListContentState,
  action: FetchCaseListSuccessAction,
): CaseListContentState => {
  const { cases: caseList, count: caseCount } = action.payload;
  return { ...state, caseList, caseCount, listLoading: false, fetchError: undefined };
};

export const FETCH_CASE_LIST_ERROR = `${FETCH_CASE_LIST}_REJECTED` as const;
type CaseListFetchErrorAction = { type: typeof FETCH_CASE_LIST_ERROR; payload: any };

export const fetchCaseListErrorReducer = (
  state: CaseListContentState,
  action: CaseListFetchErrorAction,
): CaseListContentState => ({ ...state, listLoading: false, fetchError: action.payload });

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
