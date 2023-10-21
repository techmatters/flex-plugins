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
import { LOAD_RELATIONSHIP_ACTIONS, loadRelationshipsReducer } from './loadRelationships';

const newProfileEntry: t.ProfileEntry = {
  currentTab: t.PROFILE_TABS.details,
  profile: undefined,
  contacts: {
    loading: false,
  },
  cases: {
    loading: false,
  },
};

const initialState: t.ProfileState = {
  profiles: {},
  currentProfileId: undefined,
};

const boundLoadRelationshipsReducer = loadRelationshipsReducer(initialState);

// eslint-disable-next-line complexity
export function reduce(state = initialState, action: t.ProfileActions): t.ProfileState {
  console.log('>>>action', action);

  if (LOAD_RELATIONSHIP_ACTIONS.includes(action.type)) {
    return boundLoadRelationshipsReducer(state, action);
  }

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
