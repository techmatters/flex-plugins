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
import { AnyAction } from 'redux';
import { createAction, createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { ReferrableResource, getResource } from '../../services/ResourceService';
import {
  ReferrableResourceSearchState,
  initialState as initialSearchState,
  suggestSearchInitialState,
  suggestSearchReducer,
  resourceSearchReducer,
  SuggestSearch,
} from './search';
import { namespace } from '../storeNamespaces';
import { RootState } from '..';

export const enum ResourcePage {
  ViewResource = 'view-resource',
  Search = 'search',
}

export enum ResourceLoadStatus {
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}

type ResourceRoute = { page: ResourcePage.ViewResource; id: string } | { page: ResourcePage.Search };

const RESOURCE_EXPIRY_SECONDS = 60 * 10; // 10 minutes

const LOAD_ACTION = 'resource-action/load-resource';

export const loadResourceAsyncAction = createAsyncAction(
  LOAD_ACTION,
  async (id: string): Promise<ReferrableResource> => {
    return getResource(id);
  },
  (id: string) => ({ id }),
);

const VIEW_RESOURCE = 'resource-action/view-resource';

export const viewResourceAction = createAction(VIEW_RESOURCE, id => ({ id }));

const NAVIGATE_TO_SEARCH = 'resource-action/navigate-to-search';

export const navigateToSearchAction = createAction(NAVIGATE_TO_SEARCH);

export type ReferrableResourcesState = {
  // eslint-disable-next-line prettier/prettier
  route?: ResourceRoute
  resources: Record<
    string,
    { updated: Date } & (
      | { status: ResourceLoadStatus.Loading }
      | { status: ResourceLoadStatus.Loaded; resource: ReferrableResource; error?: Error }
      | { status: ResourceLoadStatus.Error; error: Error; resource?: ReferrableResource }
    )
  >;
  search: ReferrableResourceSearchState;
  suggestSearch: SuggestSearch;
};

const initialState: ReferrableResourcesState = {
  resources: {},
  route: {
    page: ResourcePage.Search,
  },
  search: initialSearchState,
  suggestSearch: suggestSearchInitialState,
};

const expireOldResources = (inputState: ReferrableResourcesState, now: Date): ReferrableResourcesState => ({
  ...inputState,
  resources: Object.fromEntries(
    Object.entries(inputState.resources).filter(([, { updated }]) =>
      isBefore(now, addSeconds(updated, RESOURCE_EXPIRY_SECONDS)),
    ),
  ),
});

const resourceReducer = createReducer(initialState, handleAction => [
  handleAction(loadResourceAsyncAction.pending as typeof loadResourceAsyncAction, (state, action) => {
    return {
      ...state,
      resources: {
        ...state.resources,
        [action.meta.id]: { status: ResourceLoadStatus.Loading, updated: new Date() },
      },
    };
  }),
  handleAction(loadResourceAsyncAction.fulfilled, (state, action) => {
    return {
      ...state,
      resources: {
        ...state.resources,
        [action.payload.id]: { status: ResourceLoadStatus.Loaded, updated: new Date(), resource: action.payload },
      },
    };
  }),
  handleAction(loadResourceAsyncAction.rejected, (state, action) => {
    return {
      ...state,
      resources: {
        ...state.resources,
        [(action as any).meta.id]: { status: ResourceLoadStatus.Error, updated: new Date(), error: action.payload },
      },
    };
  }),
  handleAction(viewResourceAction, (state, { payload }) => {
    return {
      ...state,
      route: { page: ResourcePage.ViewResource, id: payload.id },
    };
  }),
  handleAction(navigateToSearchAction, state => {
    return {
      ...state,
      route: { page: ResourcePage.Search },
    };
  }),
]);

export function reduce(inputState = initialState, action: AnyAction): ReferrableResourcesState {
  const now = new Date();
  const state: ReferrableResourcesState = {
    ...expireOldResources(inputState, now),
    search: resourceSearchReducer(inputState.search, action),
    suggestSearch: suggestSearchReducer(inputState.suggestSearch, action),
  };
  return resourceReducer(state, action as any);
}

export const selectResourceById = (
  {
    [namespace]: {
      referrableResources: { resources },
    },
  }: RootState,
  resourceId: string,
) => resources[resourceId];

export const selectResourceData = (state: RootState, resourceId: string): ReferrableResource | undefined => {
  const resourceState = selectResourceById(state, resourceId);
  if (!resourceState || resourceState.status === ResourceLoadStatus.Loading) {
    return undefined;
  }
  return resourceState.resource;
};

export const selectResourceError = (state: RootState, resourceId: string): Error | undefined => {
  const resourceState = selectResourceById(state, resourceId);
  if (!resourceState || resourceState.status === ResourceLoadStatus.Loading) {
    return undefined;
  }
  return resourceState.error;
};
