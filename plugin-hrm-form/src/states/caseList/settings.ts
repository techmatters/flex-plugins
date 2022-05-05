import { ListCasesFilters, ListCasesSort, ListCasesSortBy, ListCasesSortDirection } from '../../types/types';

// State

export type CaseListSettingsState = {
  filter: ListCasesFilters;
  sort: ListCasesSort;
  page: number;
};

export const caseListSettingsInitialState = (): CaseListSettingsState => ({
  filter: {
    includeOrphans: false,
    counsellors: [],
    statuses: [],
    categories: [],
  },
  sort: {
    sortBy: ListCasesSortBy.ID,
    sortDirection: ListCasesSortDirection.DESC,
  },
  page: 0,
});

// Update filter action & reducer
export const UPDATE_CASE_LIST_FILTER = 'UPDATE_CASE_LIST_FILTER';

export type UpdateCaseListFilterAction = {
  type: typeof UPDATE_CASE_LIST_FILTER;
  filter: Partial<ListCasesFilters>;
};

export const updateCaseListFilter = (filter: Partial<ListCasesFilters>): UpdateCaseListFilterAction => ({
  type: UPDATE_CASE_LIST_FILTER,
  filter,
});

export function updatedFilterReducer(
  state: CaseListSettingsState,
  action: UpdateCaseListFilterAction,
): CaseListSettingsState {
  return {
    ...state,
    filter: { ...state.filter, ...action.filter },
    page: 0,
  };
}

// Clear filter action & reducer
export const CLEAR_CASE_LIST_FILTER = 'CLEAR_CASE_LIST_FILTER';

export type ClearCaseListFilterAction = {
  type: typeof CLEAR_CASE_LIST_FILTER;
};

export const clearCaseListFilter = (): ClearCaseListFilterAction => ({
  type: CLEAR_CASE_LIST_FILTER,
});

export function clearFilterReducer(
  state: CaseListSettingsState,
  action: ClearCaseListFilterAction,
): CaseListSettingsState {
  return {
    ...state,
    filter: caseListSettingsInitialState().filter,
    page: 0,
  };
}

// Update sort action & reducer
export const UPDATE_CASE_LIST_SORT = 'UPDATE_CASE_LIST_SORT';

export type UpdateCaseListSortAction = {
  type: typeof UPDATE_CASE_LIST_SORT;
  sort: ListCasesSort;
};

export const updateCaseListSort = (sort: ListCasesSort): UpdateCaseListSortAction => ({
  type: UPDATE_CASE_LIST_SORT,
  sort,
});

export const updatedSortReducer = (state: CaseListSettingsState, action: UpdateCaseListSortAction) => ({
  ...state,
  sort: action.sort,
  page: 0,
});

// Update sort action & reducer
export const UPDATE_CASE_LIST_PAGE = 'UPDATE_CASE_LIST_PAGE';

export type UpdateCaseListPageAction = {
  type: typeof UPDATE_CASE_LIST_PAGE;
  page: number;
};

export const updateCaseListPage = (page: number): UpdateCaseListPageAction => ({
  type: UPDATE_CASE_LIST_PAGE,
  page,
});

export const updatedPageReducer = (state: CaseListSettingsState, action: UpdateCaseListPageAction) => ({
  ...state,
  page: action.page,
});

export type CaseListSettingsActionType =
  | UpdateCaseListFilterAction
  | ClearCaseListFilterAction
  | UpdateCaseListSortAction
  | UpdateCaseListPageAction;
