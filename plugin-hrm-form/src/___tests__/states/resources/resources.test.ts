import { addDays, isAfter, subDays } from 'date-fns';

import { addResource, reduce, ReferrableResourcesState, ResourcePage, viewResource } from '../../../states/resources';

const resource = (
  id: string,
  loaded: Date,
): ReferrableResourcesState['resources'][keyof ReferrableResourcesState['resources']] => ({
  resource: {
    name: `Resource with id#${id}`,
    id,
  },
  loaded,
});
const now = new Date();
describe('reduce', () => {
  test('Always removes any resources in state with a data significantly older than now', () => {
    const state = reduce(
      {
        resources: {
          newResource: resource('newResource', now),
          oldResource: resource('oldResource', subDays(now, 1)),
          futureResource: resource('futureResource', addDays(now, 1)),
        },
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
        },
        addResource({ id: 'newResource', name: 'New Resource' }),
      );
      expect(state.resources.existingResource).toStrictEqual(resource('existingResource', now));
      expect(state.resources.newResource.resource).toStrictEqual({ id: 'newResource', name: 'New Resource' });
      expect(isAfter(state.resources.newResource.loaded, now)).toBe(true);
    });
    test('Resource not in state already - adds resource to state with current date', () => {
      const state = reduce(
        {
          resources: {
            existingResource: resource('existingResource', now),
          },
        },
        addResource({ id: 'existingResource', name: 'Updated Resource' }),
      );
      expect(state.resources.existingResource.resource).toStrictEqual({
        id: 'existingResource',
        name: 'Updated Resource',
      });
      expect(isAfter(state.resources.existingResource.loaded, now)).toBe(true);
      expect(Object.keys(state.resources)).toHaveLength(1);
    });
  });
  describe('VIEW_RESOURCE action', () => {
    const initialState = {
      resources: {
        existingResource: resource('existingResource', now),
      },
    };
    test('Resource with ID exists - set route to viewing resource with that ID', () => {
      const state = reduce(initialState, viewResource('existingResource'));
      expect(state).toStrictEqual({
        ...initialState,
        route: {
          page: ResourcePage.ViewResource,
          id: 'existingResource',
        },
      });
    });
    test("Resource with ID doesn't exists - set route to viewing resource with that ID anyway", () => {
      const state = reduce(initialState, viewResource('notExistingResource'));
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
        viewResource('thisResource'),
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
