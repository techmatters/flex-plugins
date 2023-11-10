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

import { parseFetchError } from '../parseFetchError';
import * as ProfileService from '../../services/ProfileService';
import * as t from './types';

export const loadProfileFlagsAsync = createAsyncAction(t.LOAD_PROFILE_FLAGS, ProfileService.getProfileFlags);

const loadProfileFlagsEntryIntoRedux = (state: t.ProfileFlagsState, profileFlagsUpdate: any) => ({
  ...state,
  ...profileFlagsUpdate,
});

const handleLoadProfileFlagsPendingAction = (state: t.ProfileFlagsState) => {
  const update = {
    loading: true,
    error: undefined,
  };

  return loadProfileFlagsEntryIntoRedux(state, update);
};

const handleLoadProfileFlagsRejectedAction = (state: t.ProfileFlagsState, action: any) => {
  const error = parseFetchError(action.payload);

  const update = {
    loading: false,
    error,
  };

  return loadProfileFlagsEntryIntoRedux(state, update);
};

const handleLoadProfileFlagsFulfilledAction = (state: t.ProfileFlagsState, action: any) => {
  const update = {
    loading: false,
    data: action.payload,
  };

  return loadProfileFlagsEntryIntoRedux(state, update);
};

const profileFlagsReducer = (initialState: t.ProfileFlagsState = t.initialProfileFlagsState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfileFlagsAsync.pending, handleLoadProfileFlagsPendingAction),
    handleAction(loadProfileFlagsAsync.rejected, handleLoadProfileFlagsRejectedAction),
    handleAction(loadProfileFlagsAsync.fulfilled, handleLoadProfileFlagsFulfilledAction),
  ]);

export default profileFlagsReducer;
