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

import { addDays, subDays, subHours } from 'date-fns';
import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import {
  loadResourceAsyncAction,
  navigateToSearchAction,
  reduce,
  ReferrableResourcesState,
  ResourceLoadStatus,
  ResourcePage,
  viewResourceAction,
} from '../../../states/resources';
import {
  initialState,
  initialState as searchInitialState,
  resourceSearchReducer,
} from '../../../states/resources/search';
import { getResource, ReferrableResource } from '../../../services/ResourceService';

jest.mock('../../../states/resources/search', () => ({
  initialState: jest.requireActual('../../../states/resources/search').initialState,
  resourceSearchReducer: jest.fn(),
}));
jest.mock('../../../services/ResourceService');

const mockGetResource = getResource as jest.Mock<Promise<ReferrableResource>>;

const testStore = (stateChanges: Partial<ReferrableResourcesState> = {}) =>
  configureStore({
    preloadedState: { ...initialState, ...stateChanges },
    reducer: reduce,
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

const mockResourceSearchReducer = resourceSearchReducer as jest.Mock<ReturnType<typeof resourceSearchReducer>>;

beforeEach(() => {
  mockResourceSearchReducer.mockClear();
  mockResourceSearchReducer.mockImplementation(state => state);
});

const resource = (id: string): ReferrableResource => ({
  name: `Resource with id#${id}`,
  id,
  attributes: {},
});

const loadedResourceState = (
  id: string,
  updated: Date,
): ReferrableResourcesState['resources'][keyof ReferrableResourcesState['resources']] & {
  status: ResourceLoadStatus.Loaded;
} => ({
  resource: resource(id),
  updated,
  status: ResourceLoadStatus.Loaded,
});
const now = new Date();
describe('reduce', () => {
  test('Always delegates to search reducer', () => {
    reduce({ resources: {}, search: searchInitialState }, { type: 'NOT_FOR_THE_LIKES_OF_YOU' } as any);
    expect(mockResourceSearchReducer).toHaveBeenCalledWith(searchInitialState, { type: 'NOT_FOR_THE_LIKES_OF_YOU' });
  });
  test('Always removes any resources in state with a data significantly older than now', () => {
    const state = reduce(
      {
        resources: {
          newResource: loadedResourceState('newResource', now),
          oldResource: loadedResourceState('oldResource', subDays(now, 1)),
          futureResource: loadedResourceState('futureResource', addDays(now, 1)),
        },
        search: searchInitialState,
      },
      { type: 'NOT_FOR_THE_LIKES_OF_YOU' } as any,
    );
    expect(state.resources).toStrictEqual({
      newResource: loadedResourceState('newResource', now),
      futureResource: loadedResourceState('futureResource', addDays(now, 1)),
    });
  });
  describe('loadResource async action', () => {
    beforeEach(() => {
      mockGetResource.mockReset();
    });
    test('Always calls getResource with ID from action', async () => {
      mockGetResource.mockResolvedValueOnce(loadedResourceState('someId', now).resource);
      loadResourceAsyncAction('someId');
      expect(mockGetResource).toHaveBeenCalledWith('someId');
    });
    test('Sets status of resource to loading', async () => {
      const { dispatch, getState } = testStore({ resources: {} });
      const startingState = getState();
      mockGetResource.mockResolvedValueOnce(loadedResourceState('someId', now).resource);
      dispatch(loadResourceAsyncAction('someId'));
      expect(getState()).toStrictEqual({
        ...startingState,
        resources: { someId: { status: ResourceLoadStatus.Loading, updated: expect.anything() } },
      });
    });
    test('Overwrites existing resource with pending state', async () => {
      const { dispatch, getState } = testStore({
        resources: { someId: loadedResourceState('someId', subHours(new Date(), 2)) },
      });
      const startingState = getState();
      mockGetResource.mockResolvedValueOnce(loadedResourceState('someId', now).resource);
      dispatch(loadResourceAsyncAction('someId'));
      expect(getState()).toStrictEqual({
        ...startingState,
        resources: { someId: { status: ResourceLoadStatus.Loading, updated: expect.anything() } },
      });
    });
    test("getResource returns a resource - dispatches fulfilled action that updates the pending resource's status to loaded and sets the resource to the one in the response", async () => {
      const resourceToLoad = resource('someId');
      mockGetResource.mockResolvedValueOnce(resourceToLoad);
      const { dispatch, getState } = testStore({ resources: {} });
      const startingState = getState();
      const dispatchPromise = (dispatch(loadResourceAsyncAction('someId')) as unknown) as PromiseLike<unknown>;
      await dispatchPromise;
      const fulfilledState = getState();
      expect(fulfilledState).toStrictEqual({
        ...startingState,
        resources: {
          someId: { status: ResourceLoadStatus.Loaded, updated: expect.anything(), resource: resourceToLoad },
        },
      });
    });
    test("getResource returns an error - dispatches rejected action that updates the pending resource's status to error and attaches the error object to the state", async () => {
      const errorThrown = new Error('BOOM');
      mockGetResource.mockRejectedValue(errorThrown);
      const { dispatch, getState } = testStore({ resources: {} });
      const startingState = getState();
      try {
        await ((dispatch(loadResourceAsyncAction('someId')) as unknown) as PromiseLike<unknown>);
      } catch (error) {
        // Error still bubbles up
      }
      const rejectedState = getState();
      expect(rejectedState).toStrictEqual({
        ...startingState,
        resources: {
          someId: { status: ResourceLoadStatus.Error, updated: expect.anything(), error: errorThrown },
        },
      });
    });
  });
  describe('VIEW_RESOURCE action', () => {
    const initialState = {
      resources: {
        existingResource: loadedResourceState('existingResource', now),
      },
      search: searchInitialState,
    };
    test('Resource with ID exists - set route to viewing resource with that ID', () => {
      const state = reduce(initialState, viewResourceAction('existingResource'));
      expect(state).toStrictEqual({
        ...initialState,
        route: {
          page: ResourcePage.ViewResource,
          id: 'existingResource',
        },
      });
    });
    test("Resource with ID doesn't exists - set route to viewing resource with that ID anyway", () => {
      const state = reduce(initialState, viewResourceAction('notExistingResource'));
      expect(state).toStrictEqual({
        ...initialState,
        route: {
          page: ResourcePage.ViewResource,
          id: 'notExistingResource',
        },
      });
    });
    test('Route already set - overwrites it', () => {
      const state = reduce(
        {
          ...initialState,
          route: {
            page: ResourcePage.ViewResource,
            id: 'otherResource',
          },
        },
        viewResourceAction('thisResource'),
      );
      expect(state).toStrictEqual({
        ...initialState,
        route: {
          page: ResourcePage.ViewResource,
          id: 'thisResource',
        },
      });
    });
  });
  describe('NAVIGATE_TO_SEARCH action', () => {
    const initialState = {
      resources: {
        existingResource: loadedResourceState('existingResource', now),
      },
      route: {
        page: ResourcePage.ViewResource,
        id: 'existingResource',
      },
      search: searchInitialState,
    };
    test('Sets route to search', () => {
      const state = reduce(initialState, navigateToSearchAction());
      expect(state).toStrictEqual({
        ...initialState,
        route: {
          page: ResourcePage.Search,
        },
      });
    });
    test('Route already set to search - noop', () => {
      const state = reduce(
        {
          ...initialState,
          route: {
            page: ResourcePage.Search,
          },
        },
        navigateToSearchAction(),
      );
      expect(state).toStrictEqual({
        ...initialState,
        route: {
          page: ResourcePage.Search,
        },
      });
    });
  });
});
