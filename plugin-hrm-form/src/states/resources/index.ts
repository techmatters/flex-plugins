import { addSeconds, isBefore } from 'date-fns';

import { ReferrableResource, referrableResourcesEnabled } from '../../services/ResourceService';

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
export const addResource = (resource: ReferrableResource): LoadResourceAction => ({
  type: ADD_RESOURCE,
  resource,
});

const VIEW_RESOURCE = 'resource-action/view-resource';

type ViewResourceAction = {
  type: typeof VIEW_RESOURCE;
  id: string;
};

// eslint-disable-next-line import/no-unused-modules
export const viewResource = (id: string): ViewResourceAction => ({
  type: VIEW_RESOURCE,
  id,
});

// eslint-disable-next-line import/no-unused-modules
export type ReferrableResourcesState = {
  // eslint-disable-next-line prettier/prettier
  route?: ResourceRoute
  resources: Record<string, { loaded: Date; resource: ReferrableResource }>;
  enabled: boolean;
};

const initialState: ReferrableResourcesState = {
  resources: {},
  enabled: false,
};

export function reduce(
  inputState = initialState,
  action: LoadResourceAction | ViewResourceAction,
): ReferrableResourcesState {
  const now = new Date();
  const state = {
    ...inputState,
    resources: Object.fromEntries(
      Object.entries(inputState.resources).filter(([, { loaded }]) =>
        isBefore(now, addSeconds(loaded, RESOURCE_EXPIRY_SECONDS)),
      ),
    ),
    enabled: referrableResourcesEnabled(),
  };

  switch (action.type) {
    case ADD_RESOURCE: {
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.resource.id]: { resource: action.resource, loaded: new Date() },
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
