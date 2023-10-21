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

import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import loadProfileEntryIntoRedux from './loadProfileEntryIntoRedux';
import * as t from './types';

type LoadRelationshipAsyncParams = {
  profileId: t.Profile['id'];
  type: t.ProfileRelationships;
  offset?: number;
  limit?: number;
};

export const loadRelationshipAsync = createAsyncAction(
  t.LOAD_RELATIONSHIP,
  async ({ profileId, type, offset = 0, limit = 20 }: LoadRelationshipAsyncParams): Promise<any> => {
    try {
      return await t.PROFILE_RELATIONSHIPS[type].method(profileId, offset, limit);
    } catch (error) {
      console.log('error', error);
      return error;
    }
  },
  (params: LoadRelationshipAsyncParams) => params,
);

const handlePendingAction = (state: t.ProfileState, action: any) => {
  const { profileId, type } = action.meta;

  const profileUpdate = {
    ...state.profiles[profileId],
    [type]: {
      ...state.profiles[profileId][type],
      loading: true,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleFulfilledAction = (state: t.ProfileState, action: any) => {
  const { profileId, type, offset, limit } = action.meta;
  const data = action.payload[type];

  const profileUpdate = {
    ...state.profiles[profileId],
    [type]: {
      data,
      offset,
      limit,
      loading: false,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleRejectedAction = (state: t.ProfileState, action: any) => {
  const { profileId, type } = action.meta;
  const error = action.payload;

  const profileUpdate: t.ProfileEntry = {
    ...state.profiles[profileId],
    [type]: {
      ...state.profiles[profileId][type],
      loading: false,
      error,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

export const loadRelationshipsReducer = (initialState: t.ProfileState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadRelationshipAsync.pending, (state, action) => handlePendingAction(state, action)),
    handleAction(loadRelationshipAsync.fulfilled, (state, action) => handleFulfilledAction(state, action)),
    handleAction(loadRelationshipAsync.rejected, (state, action) => handleRejectedAction(state, action)),
  ]);

export const LOAD_RELATIONSHIP_ACTIONS = [
  loadRelationshipAsync.pending.toString(),
  loadRelationshipAsync.fulfilled.toString(),
  loadRelationshipAsync.rejected.toString(),
];
