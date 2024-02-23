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
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Profile } from '../types';
import * as ProfileSelectors from '../selectors';
import { RootState } from '../..';
import { UseProfileCommonParams } from './types';
import { PermissionActions, getInitializedCan } from '../../../permissions';

export type UseProfileParams = UseProfileCommonParams;

export type UseProfileReturn = {
  profile: Profile | undefined;
  loading: boolean | undefined;
  canView: boolean;
  canFlag: boolean;
  canUnflag: boolean;
};

/**
 * Access a profile by id for the current account
 *
 * @param {UseProfileParams}
 * @returns {UseProfile} - State and actions for the profile
 */
export const useProfile = (params: UseProfileParams): UseProfileReturn => {
  const can = useMemo(() => {
    return getInitializedCan();
  }, []);

  const { profileId } = params;
  const profile = useSelector((state: RootState) => ProfileSelectors.selectProfileById(state, profileId)?.data);
  const loading = useSelector((state: RootState) => ProfileSelectors.selectProfileById(state, profileId)?.loading);

  return {
    loading,
    profile,
    canView: profile && can(PermissionActions.VIEW_PROFILE, profile),
    canFlag: profile && can(PermissionActions.FLAG_PROFILE, profile),
    canUnflag: profile && can(PermissionActions.UNFLAG_PROFILE, profile),
  };
};
