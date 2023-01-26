import { addSeconds, isBefore } from 'date-fns';

import { ReferrableResource } from '../../services/ResourceService';

export const enum ResourcePage {
  ViewResource = 'view-resource',
  Search = 'search',
}
type ResourceRoute = { page: ResourcePage.ViewResource; id: string } | { page: ResourcePage.Search };

const RESOURCE_EXPIRY_SECONDS = 60 * 10; // 10 minutes

const ADD_RESOURCE = 'resource-action/add-resource';

type LoadResourceAction = {
  type: typeof ADD_RESOURCE;
  resource: ReferrableResource;
};

// eslint-disable-next-line import/no-unused-modules
export const addResourceAction = (resource: ReferrableResource): LoadResourceAction => ({
  type: ADD_RESOURCE,
  resource,
});

const VIEW_RESOURCE = 'resource-action/view-resource';

type ViewResourceAction = {
  type: typeof VIEW_RESOURCE;
  id: string;
};

// eslint-disable-next-line import/no-unused-modules
export const viewResourceAction = (id: string): ViewResourceAction => ({
  type: VIEW_RESOURCE,
  id,
});

// eslint-disable-next-line import/no-unused-modules
export type ReferrableResourcesState = {
  // eslint-disable-next-line prettier/prettier
  route?: ResourceRoute
  resources: Record<string, { loaded: Date; resource: ReferrableResource }>;
};

const initialState: ReferrableResourcesState = {
  resources: {},
  route: {
    page: ResourcePage.ViewResource,
    id: 'EXAMPLE_RESID',
  },
};

const expireOldResources = (inputState: ReferrableResourcesState, now: Date): ReferrableResourcesState => ({
  ...inputState,
  resources: Object.fromEntries(
    Object.entries(inputState.resources).filter(([, { loaded }]) =>
      isBefore(now, addSeconds(loaded, RESOURCE_EXPIRY_SECONDS)),
    ),
  ),
});

export function reduce(
  inputState = initialState,
  action: LoadResourceAction | ViewResourceAction,
): ReferrableResourcesState {
  const now = new Date();
  const state = expireOldResources(inputState, now);

  switch (action.type) {
    case ADD_RESOURCE: {
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.resource.id]: { resource: action.resource, loaded: now },
        },
      };
    }
    case VIEW_RESOURCE: {
      return {
        ...state,
        route: { page: ResourcePage.ViewResource, id: action.id },
      };
    }

    default:
      return state;
  }
}
