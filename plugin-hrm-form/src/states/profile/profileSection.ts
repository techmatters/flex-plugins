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

export const loadProfileSectionAsync = createAsyncAction(t.LOAD_PROFILE_SECTIONS, ProfileService.getProfileSection);

const loadProfileSectionEntryIntoRedux = (state: t.ProfileState, profileSectionUpdate: any) => ({
  ...state,
  profileSection: {
    ...state.profileSections,
    ...profileSectionUpdate,
  },
});

const handleLoadProfileSectionPendingAction = (state: t.ProfileState) => {
  const update = {
    loading: true,
    error: undefined,
  };
  console.log('>>> handleLoadProfileSectionPendingAction: update', update);

  return loadProfileSectionEntryIntoRedux(state, update);
};

const handleLoadProfileSectionRejectedAction = (state: t.ProfileState, action: any) => {
  const error = parseFetchError(action.payload);
  const update = {
    loading: false,
    error,
  };
  console.log('>>> handleLoadProfileSectionRejectedAction: update', update);

  return loadProfileSectionEntryIntoRedux(state, update);
};

const handleLoadProfileSectionFulfilledAction = (state: t.ProfileState, action: any) => {
  const update = {
    loading: false,
    data: action.payload,
  };

  console.log('>>> handleLoadProfileSectionFulfilledAction: update', update);

  return loadProfileSectionEntryIntoRedux(state, update);
};

export const profileSectionsReducer = (initialState: t.ProfileState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfileSectionAsync.pending, handleLoadProfileSectionPendingAction),
    handleAction(loadProfileSectionAsync.rejected, handleLoadProfileSectionRejectedAction),
    handleAction(loadProfileSectionAsync.fulfilled, handleLoadProfileSectionFulfilledAction),
  ]);

const PROFILE_SECTION_ACTIONS = [
  loadProfileSectionAsync.pending.toString(),
  loadProfileSectionAsync.rejected.toString(),
  loadProfileSectionAsync.fulfilled.toString(),
];

export const shouldUseProfileSectionsReducer = (action: any) => PROFILE_SECTION_ACTIONS.includes(action.type);
