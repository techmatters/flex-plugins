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

import { createAction, createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { ReferrableResource, searchResources } from '../../services/ResourceService';

export type SearchSettings = Partial<ReferrableResourceSearchState['parameters']>;

export type ReferrableResourceResult = ReferrableResource;

export enum ResourceSearchStatus {
  NotSearched,
  ResultPending,
  ResultReceived,
  Error,
}

export type ReferrableResourceSearchState = {
  // eslint-disable-next-line prettier/prettier
  parameters: {
    generalSearchTerm: string;
    filters: Record<string, any>;
    pageSize: number;
  };
  currentPage: number;
  suggesters: Record<string, string[]>;
  results: ReferrableResourceResult[];
  status: ResourceSearchStatus;
  error?: Error;
};

export const initialState: ReferrableResourceSearchState = {
  parameters: {
    filters: {},
    generalSearchTerm: '',
    pageSize: 5,
  },
  currentPage: 0,
  suggesters: {},
  status: ResourceSearchStatus.NotSearched,
  results: [],
};

const CHANGE_SEARCH_RESULT_PAGE_ACTION = 'resource-action/change-search-result-page';

export const changeResultPageAction = createAction(CHANGE_SEARCH_RESULT_PAGE_ACTION, (page: number) => ({
  page,
}));

const UPDATE_SEARCH_FORM_ACTION = 'resource-action/update-search-form';

export const updateSearchFormAction = createAction(
  UPDATE_SEARCH_FORM_ACTION,
  (parameters: SearchSettings) => parameters,
);

const RESET_SEARCH_FORM_ACTION = 'resource-action/reset-search-form';

export const resetSearchFormAction = createAction(RESET_SEARCH_FORM_ACTION);

const RETURN_TO_SEARCH_FORM_ACTION = 'resource-action/return-to-search-form';

export const returnToSearchFormAction = createAction(RETURN_TO_SEARCH_FORM_ACTION);

const SEARCH_ACTION = 'resource-action/search';

export const searchResourceAsyncAction = createAsyncAction(
  SEARCH_ACTION,
  async (parameters: SearchSettings, page: number) => {
    const { pageSize, generalSearchTerm } = parameters;
    const start = page * pageSize;
    return { ...(await searchResources({ generalSearchTerm, filters: {} }, start, pageSize)), start };
  },
  ({ pageSize }: SearchSettings, page: number, newSearch: boolean = true) => ({ newSearch, start: page * pageSize }),
  // { promiseTypeDelimiter: '/' }, // Doesn't work :-(
);

/*
 * To prevent insane arrays being allocated if totalCount is huge.
 * We can always do something fancier if we every actually care about the beyond the 10000th search result
 * (most users don't care about much beyond the 10th search result)
 */
const HARD_SEARCH_RESULT_LIMIT = 10000;

export const resourceSearchReducer = createReducer(initialState, handleAction => [
  /*
   * Cast is a workaround for https://github.com/omichelsen/redux-promise-middleware-actions/issues/13
   * TODO: create a generalised type to put meta property back into all 3 actions for any async action set
   */
  handleAction(searchResourceAsyncAction.pending as typeof searchResourceAsyncAction, (state, action) => {
    return {
      ...state,
      results: action.meta.newSearch ? [] : state.results,
      status: ResourceSearchStatus.ResultPending,
    };
  }),
  handleAction(searchResourceAsyncAction.fulfilled, (state, { payload }) => {
    // If total number of results changes for any reason, assume result set is stale & clear it out
    const boundedResultCount = Math.min(payload.totalCount, HARD_SEARCH_RESULT_LIMIT);
    const fullResults =
      boundedResultCount === state.results.length ? state.results : new Array(boundedResultCount).fill(null);
    fullResults.splice(payload.start, payload.results.length, ...payload.results);
    return {
      ...state,
      status: ResourceSearchStatus.ResultReceived,
      results: fullResults,
    };
  }),
  handleAction(searchResourceAsyncAction.rejected, (state, { payload }) => {
    return {
      ...state,
      status: ResourceSearchStatus.Error,
      error: payload,
    };
  }),
  handleAction(updateSearchFormAction, (state, { payload }) => {
    return {
      ...state,
      parameters: { ...state.parameters, ...payload },
    };
  }),
  handleAction(resetSearchFormAction, state => {
    return {
      ...state,
      parameters: initialState.parameters,
    };
  }),
  handleAction(changeResultPageAction, (state, { payload: { page } }) => {
    return {
      ...state,
      currentPage: page,
    };
  }),
  handleAction(returnToSearchFormAction, state => {
    return {
      ...state,
      status: ResourceSearchStatus.NotSearched,
      currentPage: 0,
    };
  }),
]);

export const getCurrentPageResults = ({
  results,
  currentPage,
  parameters: { pageSize },
}: ReferrableResourceSearchState) => results.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

export const getPageCount = ({ results, parameters: { pageSize } }: ReferrableResourceSearchState) =>
  Math.ceil(results.length / pageSize);
