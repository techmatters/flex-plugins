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
import { combineReducers } from 'redux';

import * as t from './types';

import { identifierReducer } from './identifier';
import { profileReducer } from './profile';
import { profileSectionsReducer } from './profileSection';
import { profileFlagsReducer } from './profileFlag';

const reducers = {
  identifiers: identifierReducer(),
  profiles: profileReducer(),
  profileFlags: profileFlagsReducer(),
  profileSections: profileSectionsReducer(),
};

const combinedReducers = combineReducers(reducers);

export const reduce = (state = t.initialState, action: t.ProfileActions): t.ProfileState =>
  combinedReducers(state, action);
