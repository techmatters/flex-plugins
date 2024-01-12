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

import {
  Case,
  Contact,
  Identifier,
  Profile,
  ProfileFlag,
  ProfileSection,
  ProfilesListSort,
  ProfilesListSortBy,
  SortDirection,
} from '../../types/types';
import { getProfileContacts, getProfileCases } from '../../services/ProfileService';
import { ParseFetchErrorResult } from '../parseFetchError';

export type { Case, Contact, Identifier, Profile, ProfileFlag, ProfileSection };

// Action types
export const PROFILE_RELATIONSHIPS_UPDATE_PAGE = 'profile/relationships/UPDATE_PAGE';
export const LOAD_IDENTIFIER_BY_IDENTIFIER = 'profile/identifiers/LOAD_BY_IDENTIFIER';
export const LOAD_PROFILE = 'profile/profiles/LOAD';
export const LOAD_PROFILE_FLAGS = 'profile/profileFlags/LOAD';
export const LOAD_RELATIONSHIP = 'profile/relationships/LOAD';
export const ASSOCIATE_PROFILE_FLAG = 'profile/profileFlags/ASSOCIATE';
export const DISASSOCIATE_PROFILE_FLAG = 'profile/profileFlags/DISASSOCIATE';
export const LOAD_PROFILE_SECTIONS = 'profile/profileSections/LOAD';
export const CREATE_PROFILE_SECTION = 'profile/profileSections/CREATE';
export const UPDATE_PROFILE_SECTION = 'profile/profileSections/UPDATE';
export const PROFILES_LIST_UPDATE_PAGE = 'profile/profilesList/UPDATE_PAGE';
export const PROFILES_LIST_UPDATE_FILTER = 'profile/profilesList/UPDATE_FILTER';
export const PROFILES_LIST_UPDATE_SETTINGS = 'profile/profilesList/UPDATE_SETTINGS';
export const LOAD_PROFILES_LIST = 'profile/profilesList/LOAD';

export type IdentifierEntry = {
  data?: Identifier;
  error?: ParseFetchErrorResult;
  loading: boolean;
};

export type IdentifiersState = {
  [identifierId: Identifier['id']]: IdentifierEntry;
};

export type ProfilesState = {
  [profileId: Profile['id']]: ProfileEntry;
};

export type ProfileFlagsState = {
  data?: ProfileFlag[];
  error?: ParseFetchErrorResult;
  loading: boolean;
};

export const initialProfileFlagsState: ProfileFlagsState = {
  error: undefined,
  loading: false,
  data: undefined,
};

export type ProfilesListState = {
  error: ParseFetchErrorResult;
  loading: boolean;
  data: Profile['id'][];
  settings: {
    sort: ProfilesListSort;
    count: number;
    filter?: any;
    page: number;
  };
};

export const initialProfilesListState: ProfilesListState = {
  error: null,
  loading: false,
  data: [],
  settings: {
    sort: {
      sortBy: ProfilesListSortBy.ID,
      sortDirection: SortDirection.DESC,
    },
    count: 0,
    filter: undefined,
    page: 0,
  },
};

export const PROFILE_RELATIONSHIPS = {
  cases: {
    method: getProfileCases,
  },
  contacts: {
    method: getProfileContacts,
  },
} as const;

export type ProfileRelationships = keyof typeof PROFILE_RELATIONSHIPS;
export type ProfileRelationshipTypes = Case | Contact;

export type ProfileAsyncCommon<t> = {
  loading: boolean;
  error?: ParseFetchErrorResult;
  data?: t;
};

export type ProfileAsyncRelationships = {
  [type in ProfileRelationships]: ProfileAsyncCommon<ProfileRelationshipTypes[]> & {
    page: number;
    total?: number;
  };
};

export type ProfileEntry = ProfileAsyncRelationships &
  ProfileAsyncCommon<Profile> & {
    sections?: {
      [sectionType: ProfileSection['sectionType']]: ProfileAsyncCommon<ProfileSection>;
    };
  };

export type ProfileSectionsState = ProfileAsyncCommon<ProfileSection>;

export type ProfileState = {
  identifiers: IdentifiersState;
  profiles: ProfilesState;
  profileFlags: ProfileFlagsState;
  profilesList: ProfilesListState;
};

export const newProfileEntry: ProfileEntry = {
  error: undefined,
  loading: false,
  data: undefined,
  contacts: {
    loading: false,
    page: 0,
  },
  cases: {
    loading: false,
    page: 0,
  },
  sections: {},
};

export const newIdentifierEntry: IdentifierEntry = {
  error: undefined,
  loading: false,
  data: undefined,
};

export const initialState: ProfileState = {
  identifiers: {},
  profiles: {},
  profileFlags: {
    loading: false,
  },
  profilesList: initialProfilesListState,
};
