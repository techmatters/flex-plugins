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

import { Case, Contact, Profile } from '../../types/types';
import { getProfileContacts, getProfileCases } from '../../services/ProfileService';

export type { Case, Contact, Profile } from '../../types/types';

// Action types
export const CHANGE_PROFILE_TAB = 'CHANGE_SEARCH_PAGE';
export const ADD_PROFILE_STATE = 'ADD_PROFILE_STATE';
export const SET_CURRENT_PROFILE = 'SET_CURRENT_PROFILE';
export const LOAD_RELATIONSHIP = 'LOAD_RELATIONSHIP';

export const PROFILE_TABS = {
  contacts: 'contacts',
  cases: 'cases',
  details: 'details',
} as const;

export type ProfileTabs = typeof PROFILE_TABS[keyof typeof PROFILE_TABS];

export const PROFILE_RELATIONSHIPS = {
  contacts: {
    method: getProfileContacts,
  },
  cases: {
    method: getProfileCases,
  },
} as const;

export type ProfileRelationships = keyof typeof PROFILE_RELATIONSHIPS;
export type ProfileRelationshipTypes = Case | Contact;

export type ProfileEntry = {
  currentTab: ProfileTabs;
  profile?: Profile;
  contacts?: {
    data?: Contact[];
    loading: boolean;
    error?: any;
  };
  cases?: {
    data?: Case[];
    loading: boolean;
    error?: any;
  };
};

export type ProfileState = {
  profiles: {
    [profileId: string]: ProfileEntry;
  };
  currentProfileId?: string;
};

type AddProfileState = { type: typeof ADD_PROFILE_STATE; profileId: Profile['id']; profile?: Profile };
type ChangeProfileTab = { type: typeof CHANGE_PROFILE_TAB; tab: ProfileTabs; profileId: Profile['id'] };
type SetCurrentProfile = { type: typeof SET_CURRENT_PROFILE; profileId: Profile['id'] };

export type ProfileActions = AddProfileState | ChangeProfileTab | SetCurrentProfile;
