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

import { addSeconds, isBefore } from 'date-fns';

import { ReferrableResource } from '../../services/ResourceService';

export const enum ResourcePage {
  ViewResource = 'view-resource',
  Search = 'search',
}
type ResourceRoute = { page: ResourcePage.ViewResource; id: string } | { page: ResourcePage.Search };

const RESOURCE_EXPIRY_SECONDS = 60 * 10; // 10 minutes

const ADD_RESOURCE = 'resource-action/add-resource';

type AddResourceAction = {
  type: typeof ADD_RESOURCE;
  resource: ReferrableResource;
};

// eslint-disable-next-line import/no-unused-modules
export const addResourceAction = (resource: ReferrableResource): AddResourceAction => ({
  type: ADD_RESOURCE,
  resource,
});

const LOAD_RESOURCE_ERROR = 'resource-action/load-resource-error';

type LoadResourceErrorAction = {
  type: typeof LOAD_RESOURCE_ERROR;
  id: string;
  error: Error;
};

export const loadResourceErrorAction = (id: string, error: Error): LoadResourceErrorAction => ({
  type: LOAD_RESOURCE_ERROR,
  id,
  error,
});

const VIEW_RESOURCE = 'resource-action/view-resource';

type ViewResourceAction = {
  type: typeof VIEW_RESOURCE;
  id: string;
};

export const viewResourceAction = (id: string): ViewResourceAction => ({
  type: VIEW_RESOURCE,
  id,
});

// eslint-disable-next-line import/no-unused-modules
export type ReferrableResourcesState = {
  // eslint-disable-next-line prettier/prettier
  route?: ResourceRoute
  resources: Record<
    string,
    { loaded: Date } & (
      | { resource: ReferrableResource; error?: Error }
      | { error: Error; resource?: ReferrableResource }
    )
  >;
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
  action: AddResourceAction | LoadResourceErrorAction | ViewResourceAction,
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
    case LOAD_RESOURCE_ERROR: {
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.id]: { error: action.error, loaded: now },
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
