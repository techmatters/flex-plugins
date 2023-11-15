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
import { loadIdentifierByIdentifierAsync } from './identifiers';
import loadProfileEntryIntoRedux from './loadProfileEntryIntoRedux';
import * as t from './types';

export const PAGE_SIZE = 20;

type ProfileId = t.Profile['id'];

type CommonRelationshipParams = {
  profileId: ProfileId;
  type: t.ProfileRelationships;
};

type LoadRelationshipAsyncParams = CommonRelationshipParams & {
  page?: number;
  loadedPage?: number;
};

export const loadRelationshipAsync = createAsyncAction(
  t.LOAD_RELATIONSHIP,
  async ({ profileId, type, page, loadedPage }: LoadRelationshipAsyncParams): Promise<any> => {
    /*
    This handles skipping forward several pages at once and loads the pages in between into state
    in a single request. This could end up with a large payload if there are dozens of pages and
    hundreds of records.
    If the tradeoff is not worth it, we can change this to only load the current page and only store
    it in state like the current behavior.
    */
    const offset = loadedPage === 0 ? 0 : loadedPage * PAGE_SIZE;
    const limit = (page + 1 - loadedPage) * PAGE_SIZE || PAGE_SIZE;

    return t.PROFILE_RELATIONSHIPS[type].method(profileId, offset, limit);
  },
  (params: LoadRelationshipAsyncParams) => params,
);

export const incrementRelationshipsPage = createAction(
  t.PROFILE_RELATIONSHIPS_INCREMENT_PAGE,
  (params: CommonRelationshipParams) => params,
);

const handleIncrementRelationshipsPageAction = (state: t.ProfilesState, action: any) => {
  const { profileId, type } = action.payload;

  const profileUpdate = {
    [type]: {
      ...state[profileId][type],
      page: state[profileId][type].page + 1,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

export const updateRelationshipsPage = createAction(
  t.PROFILE_RELATIONSHIPS_UPDATE_PAGE,
  (params: CommonRelationshipParams & { page: number }) => params,
);

const handleUpdateRelationshipsPageAction = (state: t.ProfilesState, action: any) => {
  const { profileId, type, page } = action.payload;

  const profileUpdate = {
    [type]: {
      ...state[profileId][type],
      page,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleRelationshipsPendingAction = (state: t.ProfilesState, action: any) => {
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

const handleRelationshipsFulfilledAction = (state: t.ProfilesState, action: any) => {
  const { page, profileId, type } = action.meta;

  const data = [...(state[profileId][type].data || []), ...action.payload[type]];
  const total = action.payload.count || 0;
  const exhausted = data.length >= action.payload.count;

  const loadedPage = Math.max(page + 1, state[profileId][type].loadedPage);

  const profileUpdate = {
    [type]: {
      ...state[profileId][type],
      data,
      loading: false,
      exhausted,
      loadedPage,
      total,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

const handleRelationshipsRejectedAction = (state: t.ProfilesState, action: any) => {
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
    cases: {
      ...state[profileId].cases,
      total: action.payload.casesCount,
    },
    contacts: {
      ...state[profileId].contacts,
      total: action.payload.contactsCount,
    },
    data: {
      ...t.newProfileEntry,
      ...state[profileId].data,
      ...action.payload,
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

// sections

const loadProfileSectionEntryIntoRedux = (
  state: t.ProfilesState,
  profileId: t.Profile['id'],
  sectionType: t.ProfileSection['sectionType'],
  profileSectionUpdate: any,
) => {
  const profileUpdate = {
    sections: {
      ...state[profileId].sections,
      [sectionType]: {
        ...state[profileId].sections[sectionType],
        ...profileSectionUpdate,
      },
    },
  };

  return loadProfileEntryIntoRedux(state, profileId, profileUpdate);
};

export type ProfileSectionCommonParams = {
  profileId: t.Profile['id'];
  sectionType: t.ProfileSection['sectionType'];
};

export type LoadProfileSectionAsyncParams = ProfileSectionCommonParams & {
  sectionId: t.ProfileSection['id'];
};

export const loadProfileSectionAsync = createAsyncAction(
  t.LOAD_PROFILE_SECTIONS,
  ({ profileId, sectionId }: LoadProfileSectionAsyncParams) => ProfileService.getProfileSection(profileId, sectionId),
  (params: LoadProfileSectionAsyncParams) => params,
);

const handleLoadProfileSectionPendingAction = (state: t.ProfilesState, action: any) => {
  const { profileId, sectionType } = action.meta;
  const update = {
    loading: true,
    error: undefined,
  };

  return loadProfileSectionEntryIntoRedux(state, profileId, sectionType, update);
};

const handleLoadProfileSectionRejectedAction = (state: t.ProfilesState, action: any) => {
  const { profileId, sectionType } = action.meta;
  const error = parseFetchError(action.payload);
  const update = {
    loading: false,
    error,
  };

  return loadProfileSectionEntryIntoRedux(state, profileId, sectionType, update);
};

export type CreateProfileSectionAsyncParams = ProfileSectionCommonParams & {
  content: string;
};

export const createProfileSectionAsync = createAsyncAction(
  t.CREATE_PROFILE_SECTION,
  async ({ profileId, content, sectionType }: CreateProfileSectionAsyncParams) => {
    return ProfileService.createProfileSection(profileId, content, sectionType);
  },
  (params: CreateProfileSectionAsyncParams) => params,
);

export type UpdateProfileSectionAsyncParams = CreateProfileSectionAsyncParams & {
  sectionId: t.ProfileSection['id'];
};

export const updateProfileSectionAsync = createAsyncAction(
  t.UPDATE_PROFILE_SECTION,
  async ({ profileId, sectionId, content }: UpdateProfileSectionAsyncParams) => {
    return ProfileService.updateProfileSection(profileId, sectionId, content);
  },
  (params: UpdateProfileSectionAsyncParams) => params,
);

const handleProfileSectionFulfilledAction = (state: t.ProfileState, action: any) => {
  const { profileId, sectionType } = action.meta;
  const update = {
    loading: false,
    data: action.payload,
  };

  return loadProfileSectionEntryIntoRedux(state, profileId, sectionType, update);
};

const profilesReducer = (initialState: t.ProfilesState = {}) =>
  createReducer(initialState, handleAction => [
    handleAction(loadProfileAsync.pending, handleLoadProfilePendingAction),
    handleAction(loadProfileAsync.rejected, handleLoadProfileRejectedAction),
    handleAction(loadProfileAsync.fulfilled, handleLoadProfileFulfilledAction),
    handleAction(loadIdentifierByIdentifierAsync.fulfilled, handleLoadIdentifierFulfilledAction),
    handleAction(loadRelationshipAsync.pending, handleRelationshipsPendingAction),
    handleAction(loadRelationshipAsync.fulfilled, handleRelationshipsFulfilledAction),
    handleAction(loadRelationshipAsync.rejected, handleRelationshipsRejectedAction),
    handleAction(incrementRelationshipsPage, handleIncrementRelationshipsPageAction),
    handleAction(updateRelationshipsPage, handleUpdateRelationshipsPageAction),
    handleAction(associateProfileFlagAsync.pending, handleLoadProfilePendingAction),
    handleAction(associateProfileFlagAsync.rejected, handleLoadProfileRejectedAction),
    handleAction(associateProfileFlagAsync.fulfilled, handleProfileFlagUpdateFulfilledAction),
    handleAction(disassociateProfileFlagAsync.pending, handleLoadProfilePendingAction),
    handleAction(disassociateProfileFlagAsync.rejected, handleLoadProfileRejectedAction),
    handleAction(disassociateProfileFlagAsync.fulfilled, handleProfileFlagUpdateFulfilledAction),
    handleAction(loadProfileSectionAsync.pending, handleLoadProfileSectionPendingAction),
    handleAction(loadProfileSectionAsync.rejected, handleLoadProfileSectionRejectedAction),
    handleAction(loadProfileSectionAsync.fulfilled, handleProfileSectionFulfilledAction),
    handleAction(createProfileSectionAsync.pending, handleLoadProfileSectionPendingAction),
    handleAction(createProfileSectionAsync.rejected, handleLoadProfileSectionRejectedAction),
    handleAction(createProfileSectionAsync.fulfilled, handleProfileSectionFulfilledAction),
    handleAction(updateProfileSectionAsync.pending, handleLoadProfileSectionPendingAction),
    handleAction(updateProfileSectionAsync.rejected, handleLoadProfileSectionRejectedAction),
    handleAction(updateProfileSectionAsync.fulfilled, handleProfileSectionFulfilledAction),
  ]);

export default profilesReducer;
