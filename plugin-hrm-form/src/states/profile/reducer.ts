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

import * as t from './types';
import { Profile } from '../../types/types';

type profileEntry = {
  currentTab: t.ProfileTabsType;
  profile?: Profile;
};

type ProfileState = {
  profiles: {
    [profileId: string]: profileEntry;
  };
  currentProfileId?: string;
};

const newProfileEntry: profileEntry = {
  currentTab: t.ProfileTabs.details,
  profile: undefined,
};

const initialState: ProfileState = {
  profiles: {},
  currentProfileId: undefined,
};

// eslint-disable-next-line complexity
export function reduce(state = initialState, action: t.ProfileActionType): ProfileState {
  switch (action.type) {
    case t.ADD_PROFILE_STATE: {
      return {
        ...state,
        profiles: {
          ...state.profiles,
          [action.profileId]: { ...newProfileEntry, profile: action.profile },
        },
      };
    }
    case t.CHANGE_PROFILE_TAB: {
      const profile = state.profiles[action.profileId];
      return {
        ...state,
        profiles: {
          ...state.profiles,
          [action.profileId]: { ...profile, currentTab: action.tab },
        },
      };
    }

    case t.SET_CURRENT_PROFILE:
      return {
        ...state,
        currentProfileId: action.profileId,
      };

    default:
      return state;
  }
}
