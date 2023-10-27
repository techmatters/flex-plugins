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
import { getProfileFlags } from '../../services/ProfileService';
import * as t from './types';

export const loadProfileFlagsAsync = createAsyncAction(t.LOAD_PROFILE_FLAGS, getProfileFlags);

const loadProfileFlagsEntryIntoRedux = (state: t.ProfileState, profileFlagsUpdate: any) => ({
  ...state,
  profileFlags: {
    ...state.profileFlags,
    ...profileFlagsUpdate,
  },
});

const handleLoadProfileFlagsPendingAction = (state: t.ProfileState) => {
  const update = {
    loading: true,
    error: undefined,
  };

  return loadProfileFlagsEntryIntoRedux(state, update);
};

const handleLoadProfileFlagsRejectedAction = (state: t.ProfileState, action: any) => {
  const error = parseFetchError(action.payload);

  const update = {
    loading: false,
    error,
  };

  return loadProfileFlagsEntryIntoRedux(state, update);
};

const handleLoadProfileFlagsFulfilledAction = (state: t.ProfileState, action: any) => {
  const update = {
    loading: false,
    data: action.payload,
  };

  return loadProfileFlagsEntryIntoRedux(state, update);
};

export const loadProfileFlagsReducer = (initialState: t.ProfileState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfileFlagsAsync.pending, handleLoadProfileFlagsPendingAction),
    handleAction(loadProfileFlagsAsync.rejected, handleLoadProfileFlagsRejectedAction),
    handleAction(loadProfileFlagsAsync.fulfilled, handleLoadProfileFlagsFulfilledAction),
  ]);

const LOAD_PROFILE_FLAGS_ACTIONS = [
  loadProfileFlagsAsync.pending.toString(),
  loadProfileFlagsAsync.rejected.toString(),
  loadProfileFlagsAsync.fulfilled.toString(),
];

export const shouldUseLoadProfileFlagsReducer = (action: any) => LOAD_PROFILE_FLAGS_ACTIONS.includes(action.type);
