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

import { addDays, subDays } from 'date-fns';

import {
  navigateToSearchAction,
  reduce,
  ReferrableResourcesState,
  ResourceLoadStatus,
  ResourcePage,
  viewResourceAction,
} from '../../../states/resources';
import { initialState as searchInitialState, resourceSearchReducer } from '../../../states/resources/search';

jest.mock('../../../states/resources/search', () => ({
  initialState: jest.requireActual('../../../states/resources/search').initialState,
  resourceSearchReducer: jest.fn(),
}));

const mockResourceSearchReducer = resourceSearchReducer as jest.Mock<ReturnType<typeof resourceSearchReducer>>;

beforeEach(() => {
  mockResourceSearchReducer.mockClear();
  mockResourceSearchReducer.mockImplementation(state => state);
});

const loadedResource = (
  id: string,
  updated: Date,
): ReferrableResourcesState['resources'][keyof ReferrableResourcesState['resources']] => ({
  resource: {
    name: `Resource with id#${id}`,
    id,
    attributes: {},
  },
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
          newResource: loadedResource('newResource', now),
          oldResource: loadedResource('oldResource', subDays(now, 1)),
          futureResource: loadedResource('futureResource', addDays(now, 1)),
        },
        search: searchInitialState,
      },
      { type: 'NOT_FOR_THE_LIKES_OF_YOU' } as any,
    );
    expect(state.resources).toStrictEqual({
      newResource: loadedResource('newResource', now),
      futureResource: loadedResource('futureResource', addDays(now, 1)),
    });
  });
  describe('VIEW_RESOURCE action', () => {
    const initialState = {
      resources: {
        existingResource: loadedResource('existingResource', now),
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
        existingResource: loadedResource('existingResource', now),
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
