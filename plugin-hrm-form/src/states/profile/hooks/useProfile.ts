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
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import asyncDispatch from '../../asyncDispatch';
import { Profile } from '../types';
import * as ProfileActions from '../profile';
import * as ProfileSelectors from '../selectors';
import { RootState } from '../..';

export type UseProfileLoaderParams = {
  profileId: ProfileSelectors.ProfileIdParam;
  shouldAutoload?: Boolean;
};

export type UseProfileLoaderReturn = {
  error?: any;
  loading: boolean;
  loadProfile: () => void;
};

export type UseProfileParams = UseProfileLoaderParams;

export type UseProfileReturn = UseProfileLoaderReturn & {
  profile?: Profile;
};

/**
 * Load a profile by id into redux
 * @param {UseProfileLoaderParams}
 * @returns {UseProfileLoaderReturn} - State and actions for the profile
 */
export const useProfileLoader = ({
  profileId,
  shouldAutoload = false,
}: UseProfileLoaderParams): UseProfileLoaderReturn => {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => ProfileSelectors.selectProfileById(state, profileId)?.error);
  const loading = useSelector((state: RootState) => ProfileSelectors.selectProfileById(state, profileId)?.loading);
  const loadProfile = useCallback(() => {
    asyncDispatch(dispatch)(ProfileActions.loadProfileAsync(profileId));
  }, [dispatch, profileId]);

  useEffect(() => {
    if (shouldAutoload && !loading) {
      loadProfile();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, shouldAutoload, loadProfile]);

  return {
    error,
    loading,
    loadProfile,
  };
};

/**
 * Access a profile by id for the current account
 *
 * @param {UseProfileParams}
 * @returns {UseProfile} - State and actions for the profile
 */
export const useProfile = (params: UseProfileParams): UseProfileReturn => {
  const { profileId } = params;
  const profile = useSelector((state: RootState) => ProfileSelectors.selectProfileById(state, profileId)?.data);

  return {
    profile,
    ...useProfileLoader(params),
  };
};

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
): Profile[T] | undefined => {
  return useSelector((state: RootState) => ProfileSelectors.selectProfilePropertyById(state, profileId, property));
};
