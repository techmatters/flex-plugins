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
import { getProfilesList } from '../../services/ProfileService';

export const loadProfilesListAsync = createAsyncAction(t.LOAD_PROFILES_LIST, getProfilesList);

const loadProfilesListEntryIntoRedux = (state: t.ProfilesListState, profilesListUpdate: any) => ({
  ...state,
  ...profilesListUpdate,
});

const handleLoadProfilesListPendingAction = (state: t.ProfilesListState) => {
  const update = {
    loading: true,
    error: undefined,
  };

  return loadProfilesListEntryIntoRedux(state, update);
};

const handleLoadProfilesListRejectedAction = (state: t.ProfilesListState, action: any) => {
  const error = action.payload;

  const update = {
    loading: false,
    error,
  };

  return loadProfilesListEntryIntoRedux(state, update);
};

const handleLoadProfilesListFulfilledAction = (state: t.ProfilesListState, action: any) => {
  const update = {
    loading: false,
    data: action.payload,
  };

  return loadProfilesListEntryIntoRedux(state, update);
};

const profilesListReducer = (initialState: t.ProfilesListState = t.initialProfilesListState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfilesListAsync.pending, handleLoadProfilesListPendingAction),
    handleAction(loadProfilesListAsync.rejected, handleLoadProfilesListRejectedAction),
    handleAction(loadProfilesListAsync.fulfilled, handleLoadProfilesListFulfilledAction),
  ]);

export default profilesListReducer;
