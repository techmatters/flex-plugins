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

import * as t from './types';
import { getProfileList } from '../../services/ProfileService';

export const loadProfileListAsync = createAsyncAction(t.LOAD_PROFILES_LIST, (params: any = {}) => {
  return getProfileList(params);
});

const loadProfileListEntryIntoRedux = (state: t.ProfileListState, profilesListUpdate: any) => ({
  ...state,
  ...profilesListUpdate,
});

const handleLoadProfileListPendingAction = (state: t.ProfileListState) => {
  const update = {
    loading: true,
    error: undefined,
  };

  return loadProfileListEntryIntoRedux(state, update);
};

const handleLoadProfileListRejectedAction = (state: t.ProfileListState, action: any) => {
  const error = action.payload;

  const update = {
    loading: false,
    error,
  };

  return loadProfileListEntryIntoRedux(state, update);
};

const handleLoadProfileListFulfilledAction = (state: t.ProfileListState, action: any) => {
  const { profiles, count } = action.payload;
  const update = {
    loading: false,
    data: profiles?.map((profile: any) => profile.id),
    count,
  };

  return loadProfileListEntryIntoRedux(state, update);
};

const profilesListReducer = (initialState: t.ProfileListState = t.initialProfileListState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfileListAsync.pending, handleLoadProfileListPendingAction),
    handleAction(loadProfileListAsync.rejected, handleLoadProfileListRejectedAction),
    handleAction(loadProfileListAsync.fulfilled, handleLoadProfileListFulfilledAction),
  ]);

export default profilesListReducer;
