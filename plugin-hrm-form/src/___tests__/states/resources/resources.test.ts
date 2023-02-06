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

import { addDays, isAfter, subDays } from 'date-fns';

import {
  addResourceAction,
  loadResourceErrorAction,
  reduce,
  ReferrableResourcesState,
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

const resource = (
  id: string,
  loaded: Date,
): ReferrableResourcesState['resources'][keyof ReferrableResourcesState['resources']] => ({
  resource: {
    name: `Resource with id#${id}`,
    id,
    attributes: {},
  },
  loaded,
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
          newResource: resource('newResource', now),
          oldResource: resource('oldResource', subDays(now, 1)),
          futureResource: resource('futureResource', addDays(now, 1)),
        },
        search: searchInitialState,
      },
      { type: 'NOT_FOR_THE_LIKES_OF_YOU' } as any,
    );
    expect(state.resources).toStrictEqual({
      newResource: resource('newResource', now),
      futureResource: resource('futureResource', addDays(now, 1)),
    });
  });
  describe('ADD_RESOURCE action', () => {
    test('Resource not in state already - adds resource to state with current date', () => {
      const state = reduce(
        {
          resources: {
            existingResource: resource('existingResource', now),
          },
          search: searchInitialState,
        },
        addResourceAction({ id: 'newResource', name: 'New Resource', attributes: {} }),
      );
      expect(state.resources.existingResource).toStrictEqual(resource('existingResource', now));
      expect(state.resources.newResource.resource).toStrictEqual({
        id: 'newResource',
        name: 'New Resource',
        attributes: {},
      });
      expect(isAfter(state.resources.newResource.loaded, now)).toBe(true);
    });
    test('Resource in state already - updates resource & sets current date', () => {
      const state = reduce(
        {
          resources: {
            existingResource: resource('existingResource', now),
          },
          search: searchInitialState,
        },
        addResourceAction({ id: 'existingResource', name: 'Updated Resource', attributes: {} }),
      );
      expect(state.resources.existingResource.resource).toStrictEqual({
        id: 'existingResource',
        name: 'Updated Resource',
        attributes: {},
      });
      expect(isAfter(state.resources.existingResource.loaded, now)).toBe(true);
      expect(Object.keys(state.resources)).toHaveLength(1);
    });
  });
  describe('LOAD_RESOURCE_ERROR action', () => {
    const err = new Error('Boom');
    test('Resource not in state already - adds error to state with current date', () => {
      const state = reduce(
        {
          resources: {
            existingResource: resource('existingResource', now),
          },
          search: searchInitialState,
        },
        loadResourceErrorAction('newResource', err),
      );
      expect(state.resources.existingResource).toStrictEqual(resource('existingResource', now));
      expect(state.resources.newResource.resource).not.toBeDefined();
      expect(state.resources.newResource.error).toBe(err);
      expect(isAfter(state.resources.newResource.loaded, now)).toBe(true);
    });
    test('Resource in state already - removes resource, adds error & sets current date', () => {
      const state = reduce(
        {
          resources: {
            existingResource: resource('existingResource', now),
          },
          search: searchInitialState,
        },
        loadResourceErrorAction('existingResource', err),
      );
      expect(state.resources.existingResource.resource).not.toBeDefined();
      expect(state.resources.existingResource.error).toBe(err);
      expect(isAfter(state.resources.existingResource.loaded, now)).toBe(true);
      expect(Object.keys(state.resources)).toHaveLength(1);
    });
  });
  describe('VIEW_RESOURCE action', () => {
    const initialState = {
      resources: {
        existingResource: resource('existingResource', now),
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
});
