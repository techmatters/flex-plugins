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
import { getProfileById } from '../../services/ProfileService';
import loadProfileEntryIntoRedux from './loadProfileEntryIntoRedux';
import * as t from './types';

type ProfileId = t.Profile['id'];

export const loadProfileAsync = createAsyncAction(t.LOAD_PROFILE, getProfileById, (profileId: ProfileId) => ({
  profileId,
}));

const handleLoadProfilePendingAction = (state: t.ProfileState, action: any) => {
  const { profileId } = action.meta;

  const profileUpdate = {
    loading: true,
    error: undefined,
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleLoadProfileRejectedAction = (state: t.ProfileState, action: any) => {
  const { profileId } = action.meta;
  const error = parseFetchError(action.payload);

  const profileUpdate = {
    loading: false,
    error,
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleLoadProfileFulfilledAction = (state: t.ProfileState, action: any) => {
  const { profileId } = action.meta;

  const profileUpdate = {
    loading: false,
    data: {
      ...state.profiles[profileId].data,
      ...action.payload,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

export const profileReducer = (initialState: t.ProfileState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfileAsync.pending, handleLoadProfilePendingAction),
    handleAction(loadProfileAsync.rejected, handleLoadProfileRejectedAction),
    handleAction(loadProfileAsync.fulfilled, handleLoadProfileFulfilledAction),
  ]);

const PROFILE_ACTIONS = [
  loadProfileAsync.pending.toString(),
  loadProfileAsync.rejected.toString(),
  loadProfileAsync.fulfilled.toString(),
];

export const shouldUseProfileReducer = (action: any) => PROFILE_ACTIONS.includes(action.type);
