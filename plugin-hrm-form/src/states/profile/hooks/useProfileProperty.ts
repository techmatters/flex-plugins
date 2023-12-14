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
import { useSelector } from 'react-redux';

import { RootState } from '../..';
import { Profile } from '../types';
import * as ProfileSelectors from '../selectors';

/**
 * Access a profile property by id for the current account
 *
 * @param {ProfileSelectors.ProfileIdParam} profileId - The id of the profile to access
 * @param {T} property - The property to access
 * @returns {UseProfile} - State and actions for the profile
 */
export const useProfileProperty = <T extends keyof Profile>(
  profileId: ProfileSelectors.ProfileIdParam,
  property: T,
): Profile[T] | undefined =>
  useSelector((state: RootState) => ProfileSelectors.selectProfilePropertyById(state, profileId, property));
