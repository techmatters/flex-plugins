/**
 * Copyright (C) 2021-2025 Technology Matters
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
import { endOfDay, formatISO, parseISO, startOfDay } from 'date-fns';

import { ApiSearchParams, SEARCH_CASES, SEARCH_CONTACTS_REQUEST, SearchParams } from './types';
import { searchCases } from '../../services/CaseService';
import { getCasesMissingVersions, getContactsMissingVersions } from '../../utils/definitionVersions';
import { SearchState } from './reducer';
import { TaskSID } from '../../types/twilio';
import { SearchCaseResult, SearchContactResult } from '../../types/types';
import { searchContacts } from '../../services/ContactService';

class SearchError extends Error {
  requestContext: {
    taskSid: TaskSID;
    context: string;
  };

  constructor(public thrownError: Error, context: SearchError['requestContext']) {
    super(`Failed to retrieve case search results: ${thrownError.message}`);
    this.cause = thrownError;
    this.requestContext = context;
  }
}

const convertSearchParamsToApiSearchParams = (searchParams: SearchParams): ApiSearchParams => ({
  ...searchParams,
  helpline: searchParams.helpline.value,
  dateFrom: searchParams.dateFrom ? formatISO(startOfDay(parseISO(searchParams.dateFrom))) : searchParams.dateFrom,
  dateTo: searchParams.dateTo ? formatISO(endOfDay(parseISO(searchParams.dateTo))) : searchParams.dateTo,
});

export const newSearchContactsAsyncAction = createAsyncAction(
  SEARCH_CONTACTS_REQUEST,
  async (taskSid: TaskSID, context: string, searchParams: SearchParams, limit: number, offset: number) => {
    try {
      const searchParamsToSubmit = convertSearchParamsToApiSearchParams(searchParams);

      const searchResult = await searchContacts({ searchParameters: searchParamsToSubmit, limit, offset });

      const definitions = await getContactsMissingVersions(searchResult.contacts);

      return {
        searchResult,
        taskSid,
        reference: `search-${taskSid}`,
        context,
        missingDefinitions: definitions,
      };
    } catch (err) {
      throw new SearchError(err, { context, taskSid });
    }
  },
  (taskSid: string, context: string) => ({ taskSid, context }),
);

export const SEARCH_CONTACTS_SUCCESS_ACTION = `${SEARCH_CONTACTS_REQUEST}_FULFILLED` as const;

export type SearchContactsSuccessAction = {
  type: typeof SEARCH_CONTACTS_SUCCESS_ACTION;
  payload: {
    missingDefinitions: Awaited<ReturnType<typeof getContactsMissingVersions>>;
    searchResult: SearchContactResult;
    taskSid: TaskSID;
  };
};

export const newSearchCasesAsyncAction = createAsyncAction(
  SEARCH_CASES,
  async (taskSid: TaskSID, context: string, searchParams: SearchParams, limit: number, offset: number) => {
    try {
      const searchParamsToSubmit = convertSearchParamsToApiSearchParams(searchParams);

      const searchResult = await searchCases({ searchParameters: searchParamsToSubmit, limit, offset });

      const definitions = await getCasesMissingVersions(searchResult.cases);

      return {
        searchResult,
        taskSid,
        reference: `search-${taskSid}`,
        context,
        missingDefinitions: definitions,
      };
    } catch (err) {
      throw new SearchError(err, { context, taskSid });
    }
  },
  (taskSid: string, context: string) => ({ taskSid, context }),
);

export const SEARCH_CASES_SUCCESS_ACTION = `${SEARCH_CASES}_FULFILLED` as const;

export type SearchCasesSuccessAction = {
  type: typeof SEARCH_CASES_SUCCESS_ACTION;
  payload: {
    missingDefinitions: Awaited<ReturnType<typeof getCasesMissingVersions>>;
    searchResult: SearchCaseResult;
    taskSid: TaskSID;
  };
};

export const resultsReducer = (initialState: SearchState): ((state: SearchState, action) => SearchState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      newSearchContactsAsyncAction.pending as typeof newSearchCasesAsyncAction,
      (state: SearchState, { meta: { taskSid, context } }) => {
        const task = state.tasks[taskSid];
        const currentEntry = state.tasks[taskSid][context];
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [taskSid]: {
              ...task,
              [context]: {
                ...currentEntry,
                isRequesting: true,
                contactRefreshRequired: false,
              },
            },
          },
        };
      },
    ),
    handleAction(
      newSearchContactsAsyncAction.fulfilled,
      (
        state: SearchState,
        {
          payload: {
            searchResult: { contacts, count },
            taskSid,
            context,
          },
        },
      ) => {
        const task = state.tasks[taskSid];
        const currentEntry = state.tasks[taskSid][context];
        const newContactsResult = {
          ids: contacts.map(c => c.id),
          count,
        };
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [taskSid]: {
              ...task,
              [context]: {
                ...currentEntry,
                searchContactsResult: newContactsResult,
                isRequesting: false,
                error: null,
              },
            },
          },
        };
      },
    ),
    handleAction(newSearchContactsAsyncAction.rejected, (state: SearchState, { payload }) => {
      if (payload instanceof SearchError) {
        const { taskSid, context } = payload.requestContext;
        const task = state.tasks[taskSid];
        const currentState = state.tasks[taskSid][context];
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [taskSid]: {
              ...task,
              [context]: {
                ...currentState,
                isRequesting: false,
                error: payload.cause,
              },
            },
          },
        };
      }
      console.warn('Error thrown not of SearchError type, lacks context to update redux state', payload);
      return state;
    }),
    handleAction(
      newSearchCasesAsyncAction.pending as typeof newSearchCasesAsyncAction,
      (state: SearchState, { meta: { taskSid, context } }) => {
        const task = state.tasks[taskSid];
        const currentEntry = state.tasks[taskSid][context];
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [taskSid]: {
              ...task,
              [context]: {
                ...currentEntry,
                isRequestingCases: true,
                caseRefreshRequired: false,
              },
            },
          },
        };
      },
    ),
    handleAction(
      newSearchCasesAsyncAction.fulfilled,
      (
        state: SearchState,
        {
          payload: {
            searchResult: { cases, count },
            taskSid,
            context,
          },
        },
      ) => {
        const task = state.tasks[taskSid];
        const currentEntry = state.tasks[taskSid][context];
        const newCasesResult = {
          ids: cases.map(c => c.id),
          count,
        };
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [taskSid]: {
              ...task,
              [context]: {
                ...currentEntry,
                searchCasesResult: newCasesResult,
                isRequestingCases: false,
                casesError: null,
              },
            },
          },
        };
      },
    ),
    handleAction(newSearchCasesAsyncAction.rejected, (state: SearchState, { payload }) => {
      if (payload instanceof SearchError) {
        const { taskSid, context } = payload.requestContext;
        const task = state.tasks[taskSid];
        const currentState = state.tasks[taskSid][context];
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [taskSid]: {
              ...task,
              [context]: {
                ...currentState,
                isRequestingCases: false,
                casesError: payload.cause,
              },
            },
          },
        };
      }
      console.warn('Error thrown not of SearchError type, lacks context to update redux state', payload);
      return state;
    }),
  ]);
