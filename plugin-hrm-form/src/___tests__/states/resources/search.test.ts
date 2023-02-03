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

import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';
import each from 'jest-each';

import { searchResources } from '../../../services/ResourceService';
import {
  initialState,
  ReferrableResourceResult,
  ReferrableResourceSearchState,
  resourceSearchReducer,
  ResourceSearchStatus,
  searchResourceAsyncAction,
} from '../../../states/resources/search';

jest.mock('../../../services/ResourceService');

const mockSearchResources = searchResources as jest.Mock<
  Promise<{ results: ReferrableResourceResult[]; totalCount: number }>
>;

const testStore = (stateChanges: Partial<ReferrableResourceSearchState> = {}) =>
  configureStore({
    preloadedState: { ...initialState, ...stateChanges },
    reducer: resourceSearchReducer,
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

describe('searchResourceAsyncAction', () => {
  beforeEach(() => {
    mockSearchResources.mockReset();
  });

  test('Calls the searchResources service, calculating the start index from the provided page & limit', () => {
    searchResourceAsyncAction({ omniSearchTerm: 'hello', limit: 42 }, 1337, true);
    expect(searchResources).toHaveBeenCalledWith({ nameSubstring: 'hello', ids: [] }, 1337 * 42, 42);
  });

  test('Semicolons in omniSearch term - splits on semicolon, first term is name, subsequent are IDs', () => {
    searchResourceAsyncAction({ omniSearchTerm: 'hello;how;are;you;today', limit: 42 }, 1337, true);
    expect(searchResources).toHaveBeenCalledWith(
      { nameSubstring: 'hello', ids: ['how', 'are', 'you', 'today'] },
      1337 * 42,
      42,
    );
  });

  test('Starts with semicolon in omniSearch term - splits on semicolon, all terms are IDs', () => {
    searchResourceAsyncAction({ omniSearchTerm: ';hello;how;are;you;today', limit: 42 }, 1337, true);
    expect(searchResources).toHaveBeenCalledWith(
      { nameSubstring: '', ids: ['hello', 'how', 'are', 'you', 'today'] },
      1337 * 42,
      42,
    );
  });

  test("'newSearch' flag set - dispatches pending action that resets the result array and sets status to ResultPending", async () => {
    const { dispatch, getState, subscribe } = testStore({ results: [null, null, null] });
    subscribe(() => console.log(getState()));
    const startingState = getState();
    dispatch(searchResourceAsyncAction({ omniSearchTerm: 'hello', limit: 42 }, 1337, true));
    const state = getState();
    expect(state).toStrictEqual({ ...startingState, status: ResourceSearchStatus.ResultPending, results: [] });
  });

  test("'newSearch' flag not set - dispatches pending action that sets status to ResultPending but leaves results array as is", async () => {
    const { dispatch, getState } = testStore({ results: [null, null, null] });
    const startingState = getState();
    dispatch(searchResourceAsyncAction({ omniSearchTerm: 'hello', limit: 42 }, 1337, false));
    const state = getState();
    expect(state).toStrictEqual({ ...startingState, status: ResourceSearchStatus.ResultPending });
  });
  describe('resourceSearch completes', () => {
    test('dispatches pending action that sets status to ResultPending, then dispatches fulfilled action that sets status to ResultReceived and adds the result to the array', async () => {
      mockSearchResources.mockResolvedValue({
        totalCount: 5,
        results: [
          { id: 'RESULT_1', name: 'Result 1', attributes: {} },
          { id: 'RESULT_2', name: 'Result 2', attributes: {} },
        ],
      });
      const { dispatch, getState } = testStore({ results: [null, null, null] });
      const startingState = getState();
      const dispatchPromise = (dispatch(
        searchResourceAsyncAction({ omniSearchTerm: 'hello', limit: 2 }, 0),
      ) as unknown) as PromiseLike<unknown>;
      const pendingState = getState();
      expect(pendingState).toStrictEqual({ ...startingState, status: ResourceSearchStatus.ResultPending, results: [] });
      await dispatchPromise;
      const fulfilledState = getState();
      expect(fulfilledState).toStrictEqual({
        ...startingState,
        status: ResourceSearchStatus.ResultReceived,
        results: [
          { id: 'RESULT_1', name: 'Result 1', attributes: {} },
          { id: 'RESULT_2', name: 'Result 2', attributes: {} },
          null,
          null,
          null,
        ],
      });
    });
    each([
      {
        description:
          'totalCount same as existing results array length - sets slice of existing array with received results',
        initialResults: [
          { id: 'EXISTING_RESULT_1', name: 'Existing Result 1', attributes: {} },
          { id: 'EXISTING_RESULT_2', name: 'Existing Result 2', attributes: {} },
          null,
          null,
        ],
        searchResponse: {
          totalCount: 4,
          results: [
            { id: 'NEW_RESULT_1', name: 'New Result 1', attributes: {} },
            { id: 'NEW_RESULT_2', name: 'New Result 2', attributes: {} },
          ],
        },
        expectedResults: [
          { id: 'EXISTING_RESULT_1', name: 'Existing Result 1', attributes: {} },
          { id: 'EXISTING_RESULT_2', name: 'Existing Result 2', attributes: {} },
          { id: 'NEW_RESULT_1', name: 'New Result 1', attributes: {} },
          { id: 'NEW_RESULT_2', name: 'New Result 2', attributes: {} },
        ],
      },
      {
        description:
          'totalCount same as existing results array length and existing results in target slice - overwrites with received results',
        initialResults: [
          null,
          { id: 'EXISTING_RESULT_1', name: 'Existing Result 1', attributes: {} },
          { id: 'EXISTING_RESULT_2', name: 'Existing Result 2', attributes: {} },
          null,
        ],
        searchResponse: {
          totalCount: 4,
          results: [
            { id: 'NEW_RESULT_1', name: 'New Result 1', attributes: {} },
            { id: 'NEW_RESULT_2', name: 'New Result 2', attributes: {} },
          ],
        },
        expectedResults: [
          null,
          { id: 'EXISTING_RESULT_1', name: 'Existing Result 1', attributes: {} },
          { id: 'NEW_RESULT_1', name: 'New Result 1', attributes: {} },
          { id: 'NEW_RESULT_2', name: 'New Result 2', attributes: {} },
        ],
      },
      {
        description: 'totalCount different to existing results array length - blanks array',
        initialResults: [
          { id: 'EXISTING_RESULT_1', name: 'Existing Result 1', attributes: {} },
          { id: 'EXISTING_RESULT_2', name: 'Existing Result 2', attributes: {} },
          null,
          null,
        ],
        searchResponse: {
          totalCount: 5,
          results: [
            { id: 'NEW_RESULT_1', name: 'New Result 1', attributes: {} },
            { id: 'NEW_RESULT_2', name: 'New Result 2', attributes: {} },
          ],
        },
        expectedResults: [
          null,
          null,
          { id: 'NEW_RESULT_1', name: 'New Result 1', attributes: {} },
          { id: 'NEW_RESULT_2', name: 'New Result 2', attributes: {} },
          null,
        ],
      },
      {
        description: 'totalCount same as existing results array length but newSearchFlag set - recreates array',
        initialResults: [
          { id: 'EXISTING_RESULT_1', name: 'Existing Result 1', attributes: {} },
          { id: 'EXISTING_RESULT_2', name: 'Existing Result 2', attributes: {} },
          null,
          null,
        ],
        searchResponse: {
          totalCount: 4,
          results: [
            { id: 'NEW_RESULT_1', name: 'New Result 1', attributes: {} },
            { id: 'NEW_RESULT_2', name: 'New Result 2', attributes: {} },
          ],
        },
        expectedResults: [
          null,
          null,
          { id: 'NEW_RESULT_1', name: 'New Result 1', attributes: {} },
          { id: 'NEW_RESULT_2', name: 'New Result 2', attributes: {} },
        ],
        newSearch: true,
      },
    ]).test('$description', async ({ initialResults, searchResponse, expectedResults, newSearch = false }) => {
      mockSearchResources.mockResolvedValue(searchResponse);
      const { dispatch, getState } = testStore({
        results: initialResults,
      });
      const startingState = getState();
      await ((dispatch(
        searchResourceAsyncAction({ omniSearchTerm: 'hello', limit: 2 }, 1, newSearch),
      ) as unknown) as PromiseLike<unknown>);
      const fulfilledState = getState();
      expect(fulfilledState).toStrictEqual({
        ...startingState,
        status: ResourceSearchStatus.ResultReceived,
        results: expectedResults,
      });
    });

    test('large totalCount - sets hard limit', async () => {
      mockSearchResources.mockResolvedValue({
        totalCount: 1000000,
        results: [
          { id: 'RESULT_1', name: 'Result 1', attributes: {} },
          { id: 'RESULT_2', name: 'Result 2', attributes: {} },
        ],
      });
      const { dispatch, getState } = testStore({ results: [] });
      await ((dispatch(searchResourceAsyncAction({ omniSearchTerm: 'hello', limit: 2 }, 0)) as unknown) as PromiseLike<
        unknown
      >);
      const fulfilledState = getState();
      expect(fulfilledState.results.length).toBeLessThan(50000);
    });
  });
  describe('resourceSearch throws an error', () => {
    test('newSearch flag set - sets error property, sets status to error and blanks results', async () => {
      const error = new Error('Boom');
      mockSearchResources.mockRejectedValue(error);
      const { dispatch, getState } = testStore({
        results: [
          { id: 'EXISTING_RESULT_1', name: 'Existing Result 1', attributes: {} },
          { id: 'EXISTING_RESULT_2', name: 'Existing Result 2', attributes: {} },
          null,
          null,
        ],
      });
      const startingState = getState();
      try {
        await ((dispatch(
          searchResourceAsyncAction({ omniSearchTerm: 'hello', limit: 2 }, 0),
        ) as unknown) as PromiseLike<unknown>);
      } catch {
        // Error still bubbles up so need to swallow it
      }
      const rejectedState = getState();
      expect(rejectedState).toStrictEqual({
        ...startingState,
        status: ResourceSearchStatus.Error,
        error,
        results: [],
      });
    });
    test('newSearch flag not set - sets error property, sets status to error but leaves results as was', async () => {
      const error = new Error('Boom');
      mockSearchResources.mockRejectedValue(error);
      const { dispatch, getState } = testStore({
        results: [
          { id: 'EXISTING_RESULT_1', name: 'Existing Result 1', attributes: {} },
          { id: 'EXISTING_RESULT_2', name: 'Existing Result 2', attributes: {} },
          null,
          null,
        ],
      });
      const startingState = getState();
      try {
        await ((dispatch(
          searchResourceAsyncAction({ omniSearchTerm: 'hello', limit: 2 }, 0, false),
        ) as unknown) as PromiseLike<unknown>);
      } catch {
        // Error still bubbles up so need to swallow it
      }
      const rejectedState = getState();
      expect(rejectedState).toStrictEqual({
        ...startingState,
        status: ResourceSearchStatus.Error,
        error,
      });
    });
  });
});
