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
import { createAction, createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { parseFetchError } from '../parseFetchError';
import loadProfileEntryIntoRedux from './loadProfileEntryIntoRedux';
import * as t from './types';

const PAGE_SIZE = 2;

type CommonParams = {
  profileId: t.Profile['id'];
  type: t.ProfileRelationships;
};

type LoadRelationshipAsyncParams = CommonParams & {
  page?: number;
};

export const loadRelationshipAsync = createAsyncAction(
  t.LOAD_RELATIONSHIP,
  async ({ profileId, type, page = 0 }: LoadRelationshipAsyncParams): Promise<any> => {
    const offset = page * PAGE_SIZE;
    const limit = PAGE_SIZE;

    return t.PROFILE_RELATIONSHIPS[type].method(profileId, offset, limit);
  },
  (params: LoadRelationshipAsyncParams) => params,
);

export const incrementPage = createAction(t.INCREMENT_PAGE, (params: CommonParams) => params);

const handlePendingAction = (state: t.ProfileState, action: any) => {
  const { profileId, type } = action.meta;

  const profileUpdate = {
    [type]: {
      ...state.profiles[profileId][type],
      loading: true,
      error: undefined,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleFulfilledAction = (state: t.ProfileState, action: any) => {
  const { page: loadedPage, profileId, type } = action.meta;

  const data = [...(state.profiles[profileId][type].data || []), ...action.payload[type]];
  const exhausted = data.length >= action.payload.count;

  const profileUpdate = {
    [type]: {
      ...state.profiles[profileId][type],
      data,
      loading: false,
      exhausted,
      loadedPage,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleRejectedAction = (state: t.ProfileState, action: any) => {
  const { profileId, type } = action.meta;
  const error = parseFetchError(action.payload);

  const profileUpdate = {
    [type]: {
      ...state.profiles[profileId][type],
      loading: false,
      error,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleIncrementPageAction = (state: t.ProfileState, action: any) => {
  const { profileId, type } = action.payload;

  const profileUpdate = {
    [type]: {
      ...state.profiles[profileId][type],
      page: state.profiles[profileId][type].page + 1,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

export const relationshipReducer = (initialState: t.ProfileState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadRelationshipAsync.pending, handlePendingAction),
    handleAction(loadRelationshipAsync.fulfilled, handleFulfilledAction),
    handleAction(loadRelationshipAsync.rejected, handleRejectedAction),
    handleAction(incrementPage, handleIncrementPageAction),
  ]);
