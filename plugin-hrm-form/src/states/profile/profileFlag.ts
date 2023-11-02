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
import loadProfileEntryIntoRedux from './loadProfileEntryIntoRedux';
import * as t from './types';

export const loadProfileFlagsAsync = createAsyncAction(t.LOAD_PROFILE_FLAGS, ProfileService.getProfileFlags);

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
  console.log('>>> handleLoadProfileFlagsFulfilledAction', state, action);

  const update = {
    loading: false,
    data: action.payload,
  };

  return loadProfileFlagsEntryIntoRedux(state, update);
};

export const associateProfileFlagAsync = createAsyncAction(
  t.ASSOCIATE_PROFILE_FLAG,
  async (profileId: t.Profile['id'], profileFlagId: t.ProfileFlag['id']) => {
    console.log('>>> Calling ProfileService.associateProfileFlag', profileId, profileFlagId);
    const result = await ProfileService.associateProfileFlag(profileId, profileFlagId);
    console.log('>>> Got result from ProfileService.associateProfileFlag', result);
    return result;
  },
  (profileId: t.Profile['id'], profileFlagId: t.ProfileFlag['id']) => ({
    profileId,
    profileFlagId,
  }),
);

export const disassociateProfileFlagAsync = createAsyncAction(
  t.DISASSOCIATE_PROFILE_FLAG,
  ProfileService.disassociateProfileFlag,
  (profileId: t.Profile['id'], profileFlagId: t.ProfileFlag['id']) => ({
    profileId,
    profileFlagId,
  }),
);

const handleProfileFlagUpdatePendingAction = (state: t.ProfileState, action: any) => {
  const { profileId } = action.meta;

  const profileUpdate = {
    loading: true,
    error: undefined,
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleProfileFlagUpdateRejectedAction = (state: t.ProfileState, action: any) => {
  const { profileId } = action.meta;
  const error = parseFetchError(action.payload);

  const profileUpdate = {
    loading: false,
    error,
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleProfileFlagUpdateFulfilledAction = (state: t.ProfileState, action: any) => {
  const { profileId } = action.meta;

  const profileUpdate = {
    loading: false,
    data: {
      ...t.newProfileEntry,
      ...state.profiles[profileId].data,
      ...action.payload,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

export const profileFlagsReducer = (initialState: t.ProfileState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfileFlagsAsync.pending, handleLoadProfileFlagsPendingAction),
    handleAction(loadProfileFlagsAsync.rejected, handleLoadProfileFlagsRejectedAction),
    handleAction(loadProfileFlagsAsync.fulfilled, handleLoadProfileFlagsFulfilledAction),
    handleAction(associateProfileFlagAsync.pending, handleProfileFlagUpdatePendingAction),
    handleAction(associateProfileFlagAsync.rejected, handleProfileFlagUpdateRejectedAction),
    handleAction(associateProfileFlagAsync.fulfilled, handleProfileFlagUpdateFulfilledAction),
    handleAction(disassociateProfileFlagAsync.pending, handleProfileFlagUpdatePendingAction),
    handleAction(disassociateProfileFlagAsync.rejected, handleProfileFlagUpdateRejectedAction),
    handleAction(disassociateProfileFlagAsync.fulfilled, handleProfileFlagUpdateFulfilledAction),
  ]);

const PROFILE_FLAGS_ACTIONS = [
  loadProfileFlagsAsync.pending.toString(),
  loadProfileFlagsAsync.rejected.toString(),
  loadProfileFlagsAsync.fulfilled.toString(),
  associateProfileFlagAsync.pending.toString(),
  associateProfileFlagAsync.rejected.toString(),
  associateProfileFlagAsync.fulfilled.toString(),
  disassociateProfileFlagAsync.pending.toString(),
  disassociateProfileFlagAsync.rejected.toString(),
  disassociateProfileFlagAsync.fulfilled.toString(),
];

export const shouldUseProfileFlagsReducer = (action: any) => PROFILE_FLAGS_ACTIONS.includes(action.type);
