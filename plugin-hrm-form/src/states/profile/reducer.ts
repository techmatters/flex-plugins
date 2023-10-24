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
import { loadProfileReducer, shouldUseLoadProfileReducer } from './loadProfile';
import { loadRelationshipsReducer, shouldUseLoadRelationshipsReducer } from './loadRelationships';
import loadProfileEntryIntoRedux from './loadProfileEntryIntoRedux';

const newProfileEntry: t.ProfileEntry = {
  error: undefined,
  loading: false,
  profile: undefined,
  contacts: {
    exhausted: false,
    loading: false,
    page: 0,
  },
  cases: {
    exhausted: false,
    loading: false,
    page: 0,
  },
};

const initialState: t.ProfileState = {
  profiles: {},
};

const boundLoadProfileReducer = loadProfileReducer(initialState);
const boundLoadRelationshipsReducer = loadRelationshipsReducer(initialState);

export function reduce(state = initialState, action: t.ProfileActions): t.ProfileState {
  if (shouldUseLoadProfileReducer(action)) {
    return boundLoadProfileReducer(state, action);
  }

  if (shouldUseLoadRelationshipsReducer(action)) {
    return boundLoadRelationshipsReducer(state, action);
  }

  // eslint-disable-next-line sonarjs/no-small-switch
  switch (action.type) {
    case t.ADD_PROFILE_STATE: {
      const profile = state.profiles[action.profileId];
      const profileUpdate = {
        ...newProfileEntry,
        ...profile,
        profile: action.profile,
      };

      return loadProfileEntryIntoRedux(state, action.profileId, profileUpdate);
    }

    default:
      return state;
  }
}
