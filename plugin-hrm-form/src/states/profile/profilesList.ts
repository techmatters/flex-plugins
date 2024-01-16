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

import * as t from './types';
import { getProfilesList } from '../../services/ProfileService';

export const loadProfilesListAsync = createAsyncAction(
  t.LOAD_PROFILES_LIST,
  ({ offset = 0, limit = 10, sortBy = 'id', sortDirection = null } = {}) => {
    return getProfilesList({ offset, limit, sortBy, sortDirection });
  },
);

const loadProfilesListStateIntoRedux = (state: t.ProfilesListState, profilesListUpdate: any): t.ProfilesListState => ({
  ...state,
  ...profilesListUpdate,
});

const handleLoadProfilesListPendingAction = (state: t.ProfilesListState) => {
  const update = {
    loading: true,
    error: undefined,
  };

  return loadProfilesListStateIntoRedux(state, update);
};

const handleLoadProfilesListRejectedAction = (state: t.ProfilesListState, action: any) => {
  const error = action.payload;

  const update = {
    loading: false,
    error,
  };

  return loadProfilesListStateIntoRedux(state, update);
};

const handleLoadProfilesListFulfilledAction = (state: t.ProfilesListState, action: any) => {
  const { profiles, count, currentPage } = action.payload;
  const update = {
    loading: false,
    data: profiles?.map((profile: t.Profile) => profile.id),
    count,
    currentPage,
  };

  return loadProfilesListStateIntoRedux(state, update);
};

export const updateProfilesListPage = createAction(t.PROFILES_LIST_UPDATE_PAGE, (params: { page: number }) => params);

const handleUpdateProfilesListPageAction = (
  state: t.ProfilesListState,
  action: ReturnType<typeof updateProfilesListPage>,
) => {
  const { page } = action.payload;

  const update = {
    ...state,
    page,
  };

  return loadProfilesListStateIntoRedux(state, update);
};

export const updateProfileListSettings = createAction(
  t.PROFILES_LIST_UPDATE_SETTINGS,
  (params: Partial<t.ProfilesListState['settings']>) => params,
);

const handleUpdateProfileListSettingsAction = (
  state: t.ProfilesListState,
  action: ReturnType<typeof updateProfileListSettings>,
) => {
  const update = {
    page: 0,
    settings: {
      ...state.settings,
      ...action.payload,
    },
  };

  return loadProfilesListStateIntoRedux(state, update);
};

const profilesListReducer = (initialState: t.ProfilesListState = t.initialProfilesListState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfilesListAsync.pending, handleLoadProfilesListPendingAction),
    handleAction(loadProfilesListAsync.rejected, handleLoadProfilesListRejectedAction),
    handleAction(loadProfilesListAsync.fulfilled, handleLoadProfilesListFulfilledAction),
    handleAction(updateProfilesListPage, handleUpdateProfilesListPageAction),
    handleAction(updateProfileListSettings, handleUpdateProfileListSettingsAction),
  ]);

export default profilesListReducer;
