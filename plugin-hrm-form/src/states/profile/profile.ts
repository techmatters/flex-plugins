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

import { parseFetchError } from '../parseFetchError';
import * as ProfileService from '../../services/ProfileService';
import { loadIdentifierByIdentifierAsync } from './identifier';
import loadProfileEntryIntoRedux from './loadProfileEntryIntoRedux';
import * as t from './types';

const PAGE_SIZE = 2;

type ProfileId = t.Profile['id'];

type CommonRelationshipParams = {
  profileId: ProfileId;
  type: t.ProfileRelationships;
};

type LoadRelationshipAsyncParams = CommonRelationshipParams & {
  page?: number;
};

export const loadRelationshipAsync = createAsyncAction(
  t.LOAD_RELATIONSHIP,
  async ({ profileId, type, page = 0 }: LoadRelationshipAsyncParams): Promise<any> => {
    const offset = page * PAGE_SIZE;
    const limit = PAGE_SIZE;

    return t.PROFILE_RELATIONSHIPS[type].method(profileId, offset, limit);
  },
  (params: LoadRelationshipAsyncParams) => params,
);

export const incrementPage = createAction(t.INCREMENT_PAGE, (params: CommonRelationshipParams) => params);

const handlePendingAction = (state: t.ProfilesState, action: any) => {
  const { profileId, type } = action.meta;

  const profileUpdate = {
    [type]: {
      ...state[profileId][type],
      loading: true,
      error: undefined,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleFulfilledAction = (state: t.ProfilesState, action: any) => {
  const { page: loadedPage, profileId, type } = action.meta;

  const data = [...(state[profileId][type].data || []), ...action.payload[type]];
  const exhausted = data.length >= action.payload.count;

  const profileUpdate = {
    [type]: {
      ...state[profileId][type],
      data,
      loading: false,
      exhausted,
      loadedPage,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleRejectedAction = (state: t.ProfilesState, action: any) => {
  const { profileId, type } = action.meta;
  const error = parseFetchError(action.payload);

  const profileUpdate = {
    [type]: {
      ...state[profileId][type],
      loading: false,
      error,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleIncrementPageAction = (state: t.ProfilesState, action: any) => {
  const { profileId, type } = action.payload;

  const profileUpdate = {
    [type]: {
      ...state[profileId][type],
      page: state[profileId][type].page + 1,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

export const loadProfileAsync = createAsyncAction(
  t.LOAD_PROFILE,
  ProfileService.getProfileById,
  (profileId: ProfileId) => ({
    profileId,
  }),
);

const handleLoadProfilePendingAction = (state: t.ProfilesState, action: any) => {
  const { profileId } = action.meta;

  const profileUpdate = {
    loading: true,
    error: undefined,
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleLoadProfileRejectedAction = (state: t.ProfilesState, action: any) => {
  const { profileId } = action.meta;
  const error = parseFetchError(action.payload);

  const profileUpdate = {
    loading: false,
    error,
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleLoadProfileFulfilledAction = (state: t.ProfilesState, action: any) => {
  const { profileId } = action.meta;

  const profileUpdate = {
    loading: false,
    data: {
      ...state[profileId].data,
      ...action.payload,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleLoadIdentifierFulfilledAction = (state: t.ProfilesState, action: any) => {
  const { profiles } = action.payload;
  let newState = { ...state };
  for (const profile of profiles) {
    const profileUpdate = {
      data: {
        ...t.newProfileEntry,
        ...newState[profile.id]?.data,
        ...profile,
      },
    };

    newState = loadProfileEntryIntoRedux(newState, profile.id, profileUpdate);
  }

  return newState;
};

export const associateProfileFlagAsync = createAsyncAction(
  t.ASSOCIATE_PROFILE_FLAG,
  ProfileService.associateProfileFlag,
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

const handleProfileFlagUpdateFulfilledAction = (state: t.ProfilesState, action: any) => {
  const { profileId } = action.meta;

  const profileUpdate = {
    loading: false,
    data: {
      ...t.newProfileEntry,
      ...state[profileId].data,
      ...action.payload,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

// sections

export const loadProfileSectionAsync = createAsyncAction(
  t.LOAD_PROFILE_SECTIONS,
  ProfileService.getProfileSection,
  (profileId: t.Profile['id'], sectionId: t.ProfileSection['id']) => ({
    profileId,
    sectionId,
  }),
);

const loadProfileSectionEntryIntoRedux = (
  state: t.ProfilesState,
  profileId: t.Profile['id'],
  sectionId: t.ProfileSection['id'],
  profileSectionUpdate: any,
) => {
  const profileUpdate = {
    sections: {
      ...state[profileId].sections,
      [sectionId]: {
        ...state[profileId].sections[sectionId],
        ...profileSectionUpdate,
      },
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleLoadProfileSectionPendingAction = (state: t.ProfilesState, action: any) => {
  const { profileId, sectionId } = action.meta;
  const update = {
    loading: true,
    error: undefined,
  };

  return loadProfileSectionEntryIntoRedux(state, profileId, sectionId, update);
};

const handleLoadProfileSectionRejectedAction = (state: t.ProfilesState, action: any) => {
  const { profileId, sectionId } = action.meta;
  const error = parseFetchError(action.payload);
  const update = {
    loading: false,
    error,
  };

  return loadProfileSectionEntryIntoRedux(state, profileId, sectionId, update);
};

const handleLoadProfileSectionFulfilledAction = (state: t.ProfilesState, action: any) => {
  const { profileId, sectionId } = action.meta;
  const update = {
    loading: false,
    data: action.payload,
  };
  console.log('>>> handleLoadProfileSectionFulfilledAction', update);

  return loadProfileSectionEntryIntoRedux(state, profileId, sectionId, update);
};

export const createProfileSectionAsync = createAsyncAction(
  t.CREATE_PROFILE_SECTION,
  async (profileId: t.Profile['id'], content: string, sectionType: string) => {
    return ProfileService.createProfileSection(profileId, content, sectionType);
  },
  (profileId: t.Profile['id'], content: string, sectionType: string) => ({
    profileId,
    content,
    sectionType,
  }),
);

export const updateProfileSectionAsync = createAsyncAction(
  t.UPDATE_PROFILE_SECTION,
  async (profileId: t.Profile['id'], sectionId: string, content: string) => {
    return ProfileService.updateProfileSection(profileId, sectionId, content);
  },
  (profileId: t.Profile['id'], sectionId: string, content: string) => ({
    profileId,
    sectionId,
    content,
  }),
);

const handleCreateProfileSectionPendingAction = (state: t.ProfilesState, action: any) => {
  const { profileId, sectionType } = action.meta;

  const sectionUpdate = {
    loading: true,
    error: undefined,
  };
  return loadProfileSectionEntryIntoRedux(state, profileId, sectionType, sectionUpdate);
};

const handleCreateProfileSectionRejectedAction = (state: t.ProfilesState, action: any) => {
  const { profileId, sectionType } = action.meta;
  const error = parseFetchError(action.payload);

  const sectionUpdate = {
    loading: false,
    error,
  };

  return loadProfileSectionEntryIntoRedux(state, profileId, sectionType, sectionUpdate);
};

const handleCreateProfileSectionFulfilledAction = (state: t.ProfilesState, action: any) => {
  const { profileId } = action.meta;

  const sectionId = action.payload.id;
  const sectionUpdate = {
    loading: false,
    data: action.payload,
  };

  return loadProfileSectionEntryIntoRedux(state, profileId, sectionId, sectionUpdate);
};

const handleUpdateProfileSectionPendingAction = (state: t.ProfilesState, action: any) => {
  const { profileId, sectionId } = action.meta;

  const update = {
    loading: true,
    error: undefined,
  };
  return loadProfileSectionEntryIntoRedux(state, profileId, sectionId, update);
};

const handleUpdateProfileSectionRejectedAction = (state: t.ProfilesState, action: any) => {
  const { profileId, sectionId } = action.meta;
  const error = parseFetchError(action.payload);

  const update = {
    loading: false,
    error,
  };

  return loadProfileSectionEntryIntoRedux(state, profileId, sectionId, update);
};

const handleUpdateProfileSectionFulfilledAction = (state: t.ProfileState, action: any) => {
  const { profileId, sectionId } = action.meta;
  const update = {
    loading: false,
    data: action.payload,
  };

  return loadProfileSectionEntryIntoRedux(state, profileId, sectionId, update);
};

export const profileReducer = (initialState: t.ProfilesState = {}) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfileAsync.pending, handleLoadProfilePendingAction),
    handleAction(loadProfileAsync.rejected, handleLoadProfileRejectedAction),
    handleAction(loadProfileAsync.fulfilled, handleLoadProfileFulfilledAction),
    handleAction(loadIdentifierByIdentifierAsync.fulfilled, handleLoadIdentifierFulfilledAction),
    handleAction(loadRelationshipAsync.pending, handlePendingAction),
    handleAction(loadRelationshipAsync.fulfilled, handleFulfilledAction),
    handleAction(loadRelationshipAsync.rejected, handleRejectedAction),
    handleAction(incrementPage, handleIncrementPageAction),
    handleAction(associateProfileFlagAsync.pending, handleLoadProfilePendingAction),
    handleAction(associateProfileFlagAsync.rejected, handleLoadProfileRejectedAction),
    handleAction(associateProfileFlagAsync.fulfilled, handleProfileFlagUpdateFulfilledAction),
    handleAction(disassociateProfileFlagAsync.pending, handleLoadProfilePendingAction),
    handleAction(disassociateProfileFlagAsync.rejected, handleLoadProfileRejectedAction),
    handleAction(disassociateProfileFlagAsync.fulfilled, handleProfileFlagUpdateFulfilledAction),
    handleAction(loadProfileSectionAsync.pending, handleLoadProfileSectionPendingAction),
    handleAction(loadProfileSectionAsync.rejected, handleLoadProfileSectionRejectedAction),
    handleAction(loadProfileSectionAsync.fulfilled, handleLoadProfileSectionFulfilledAction),
    handleAction(createProfileSectionAsync.pending, handleCreateProfileSectionPendingAction),
    handleAction(createProfileSectionAsync.rejected, handleCreateProfileSectionRejectedAction),
    handleAction(createProfileSectionAsync.fulfilled, handleCreateProfileSectionFulfilledAction),
    handleAction(updateProfileSectionAsync.pending, handleUpdateProfileSectionPendingAction),
    handleAction(updateProfileSectionAsync.rejected, handleUpdateProfileSectionRejectedAction),
    handleAction(updateProfileSectionAsync.fulfilled, handleUpdateProfileSectionFulfilledAction),
  ]);
