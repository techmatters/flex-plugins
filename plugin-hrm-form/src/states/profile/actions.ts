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

/* eslint-disable import/no-unused-modules */
import { Dispatch } from 'redux';

import { Profile } from '../../types/types';
import * as t from './types';

export { loadIdentifierByIdentifierAsync } from './identifier';
export { loadProfileAsync } from './profile';
export { loadProfileFlagsAsync } from './profileFlag';
export { loadProfileSectionAsync } from './profileSection';
export { incrementPage, loadRelationshipAsync } from './relationship';

// Action creators
export const addProfileState = (dispatch: Dispatch<any>) => (profileId: Profile['id'], profile: Profile) => {
  dispatch({ type: t.ADD_PROFILE_STATE, profileId, profile });
};
