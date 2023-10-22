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

import { getProfileById } from '../../services/ProfileService';
import loadProfileEntryIntoRedux from './loadProfileEntryIntoRedux';
import * as t from './types';

type ProfileId = t.Profile['id'];

export const loadProfileAsync = createAsyncAction(
  t.LOAD_PROFILE,
  async (profileId: ProfileId): Promise<any> => {
    try {
      return await getProfileById(profileId);
    } catch (error) {
      // See note in handleFulfilledAction about why we have to handle fetch errors in this goofy way.
      return { error };
    }
  },
  (profileId: ProfileId) => ({ profileId }),
);

const handleLoadProfilePendingAction = (state: t.ProfileState, action: any) => {
  const { profileId } = action.meta;

  const profileUpdate = {
    ...state.profiles[profileId],
    profile: {
      ...state.profiles[profileId].profile,
      loading: true,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleLoadProfileRejectedAction = (state: t.ProfileState, action: any) => {
  const { profileId } = action.meta;

  const profileUpdate = {
    ...state.profiles[profileId],
    profile: {
      ...state.profiles[profileId].profile,
      error: action.payload.error,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleLoadProfileFulfilledAction = (state: t.ProfileState, action: any) => {
  const { profileId } = action.meta;

  // This is a little weird, but since we don't have control over middleware we can't add error middleware
  // to let us use the loadRelationshipAsync.rejected action to handle errors. If we try to use that handler
  // the exception is thrown and the app crashes. So we have to check for the error here and handle it in
  // fulfilled.
  if (action.payload.error) {
    return handleLoadProfileRejectedAction(state, action);
  }

  const profileUpdate = {
    ...state.profiles[profileId],
    profile: {
      ...state.profiles[profileId].profile,
      ...action.payload,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

export const loadProfileReducer = (initialState: t.ProfileState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfileAsync.pending, handleLoadProfilePendingAction),
    handleAction(loadProfileAsync.rejected, handleLoadProfileRejectedAction),
    handleAction(loadProfileAsync.fulfilled, handleLoadProfileFulfilledAction),
  ]);

const LOAD_PROFILE_ACTIONS = [
  loadProfileAsync.pending.toString(),
  loadProfileAsync.rejected.toString(),
  loadProfileAsync.fulfilled.toString(),
];

export const shouldUseLoadProfileReducer = (action: any) => LOAD_PROFILE_ACTIONS.includes(action.type);
