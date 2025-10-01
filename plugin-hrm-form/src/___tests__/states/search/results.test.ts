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

import promiseMiddleware from 'redux-promise-middleware';
import { configureStore } from '@reduxjs/toolkit';

import * as t from '../../../states/search/types';
import { newTaskEntry, SearchState } from '../../../states/search/reducer';
import type { Case, SearchCaseResult } from '../../../types/types';
import { newSearchCasesAsyncAction, resultsReducer } from '../../../states/search/results';
import type { TaskSID } from '../../../types/twilio';
import { searchCases } from '../../../services/CaseService';
import asyncDispatch from '../../../states/asyncDispatch';
import { getCasesMissingVersions, getContactsMissingVersions } from '../../../utils/definitionVersions';

jest.mock('../../../services/CaseService', () => ({
  searchCases: jest.fn().mockResolvedValue({ cases: [], count: 0 }),
}));
jest.mock('../../../services/ContactService', () => ({
  searchContacts: jest.fn().mockResolvedValue({ contacts: [], count: 0 }),
}));
jest.mock('../../../utils/definitionVersions', () => ({
  getCasesMissingVersions: jest.fn().mockResolvedValue([]),
  getContactsMissingVersions: jest.fn().mockResolvedValue([]),
}));

const mockSearchCases = searchCases as jest.MockedFunction<typeof searchCases>;
const mockGetCasesMissingVersions = getCasesMissingVersions as jest.MockedFunction<typeof getCasesMissingVersions>;

const task = { taskSid: 'WT123' as TaskSID };
const context = 'root';

const initialState = {
  tasks: {
    [task.taskSid]: {
      [context]: newTaskEntry,
    },
  },
};
const EMPTY_SEARCH_PARAMS = {
  counselor: '',
  helpline: { value: '', label: '' },
  dateFrom: '',
  dateTo: '',
};

const boundResultsReducer = resultsReducer(initialState);

const testStore = (stateChanges: Partial<SearchState> = {}) =>
  configureStore({
    preloadedState: { ...initialState, ...stateChanges },
    reducer: boundResultsReducer,
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

beforeEach(() => {
  mockSearchCases.mockClear();
  mockSearchCases.mockResolvedValue({
    cases: [],
    count: 0,
  });
});

describe('Case Search Action', () => {
  test('when pending updates redux to requesting state, makes request and looks up missing form definitions', async () => {
    const { getState, dispatch } = testStore(initialState);
    const case1 = {} as Case;
    const case2 = {} as Case;
    mockSearchCases.mockResolvedValue({
      cases: [case1, case2],
      count: 2,
    });
    expect(getState().tasks[task.taskSid][context].isRequestingCases).toBeFalsy();

    const dispatchPromise = asyncDispatch(dispatch)(
      newSearchCasesAsyncAction(task.taskSid, context, EMPTY_SEARCH_PARAMS, 0, 0),
    );

    const { tasks } = getState();
    expect(tasks[task.taskSid][context].isRequestingCases).toBeTruthy();
    expect(mockSearchCases).toHaveBeenCalledWith({
      limit: 0,
      offset: 0,
      searchParameters: {
        ...EMPTY_SEARCH_PARAMS,
        helpline: '',
      },
    });
    expect(mockGetCasesMissingVersions).not.toHaveBeenCalled();
    await dispatchPromise;
    expect(mockGetCasesMissingVersions).toHaveBeenCalledWith([case1, case2]);
  });
  test('on success, updates redux to requesting state and marks as no longer requesting', async () => {
    const { getState, dispatch } = testStore(initialState);
    const searchResult = ({
      count: 2,
      cases: [
        {
          id: 'case-1',
          createdAt: '2020-11-23T17:38:42.227Z',
          updatedAt: '2020-11-23T17:38:42.227Z',
          helpline: '',
          info: {
            households: [{ household: { name: { firstName: 'Maria', lastName: 'Silva' } } }],
          },
        },
        {
          id: 'case-2',
          createdAt: '2020-11-23T17:38:42.227Z',
          updatedAt: '2020-11-23T17:38:42.227Z',
          helpline: '',
          info: {
            households: [{ household: { name: { firstName: 'John', lastName: 'Doe' } } }],
          },
        },
      ],
    } as unknown) as SearchCaseResult;
    mockSearchCases.mockResolvedValue(searchResult);

    expect(getState().tasks[task.taskSid][context].isRequestingCases).toBeFalsy();

    const dispatchPromise = asyncDispatch(dispatch)(
      newSearchCasesAsyncAction(task.taskSid, context, EMPTY_SEARCH_PARAMS, 0, 0),
    );
    expect(getState().tasks[task.taskSid][context].isRequestingCases).toBeTruthy();
    await dispatchPromise;

    expect(getState().tasks[task.taskSid][context].searchCasesResult).toStrictEqual({
      count: 2,
      ids: ['case-1', 'case-2'],
    });
    expect(getState().tasks[task.taskSid][context].isRequestingCases).toBeFalsy();
  });
  test('on success, updates redux to requesting state and marks as no longer requesting', async () => {
    const { getState, dispatch } = testStore(initialState);
    const serviceError = new Error('Splat!');
    mockSearchCases.mockRejectedValue(serviceError);

    expect(getState().tasks[task.taskSid][context].isRequestingCases).toBeFalsy();

    const dispatchPromise = asyncDispatch(dispatch)(
      newSearchCasesAsyncAction(task.taskSid, context, EMPTY_SEARCH_PARAMS, 0, 0),
    );
    expect(getState().tasks[task.taskSid][context].isRequestingCases).toBeTruthy();
    await dispatchPromise;
    const { casesError, searchCasesResult, isRequestingCases } = getState().tasks[task.taskSid][context];
    expect(casesError).toBe(serviceError);
    expect(searchCasesResult).toStrictEqual(initialState.tasks[task.taskSid][context].searchCasesResult);
    expect(isRequestingCases).toBeFalsy();
  });
});
