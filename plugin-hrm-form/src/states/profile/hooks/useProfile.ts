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

import { Profile } from '../types';
import * as ProfileActions from '../loadProfile';
import { namespace, profileBase } from '../../storeNamespaces';
import { RootState } from '../..';

export type UseProfileLoader = {
  error?: any;
  loading: boolean;
  loadProfile: () => void;
};

export type UseProfile = UseProfileLoader & {
  profile?: Profile;
};

const useProfileLoader = (profileId: Profile['id']): UseProfileLoader => {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => state[namespace][profileBase].profiles[profileId]?.error);
  const loading = useSelector((state: RootState) => state[namespace][profileBase].profiles[profileId]?.loading);
  const loadProfile = useCallback(() => {
    dispatch(ProfileActions.loadProfileAsync(profileId));
  }, [dispatch, profileId]);

  useEffect(() => {
    if (!loading) {
      loadProfile();
    }
  }, [profileId, loading, loadProfile]);

  return {
    error,
    loading,
    loadProfile,
  };
};

/**
 * Access a profile by id for the current account
 *
 * @param {Profile['id']} profileId - The id of the profile to access
 * @returns {UseProfile} - State and actions for the profile
 */
export const useProfile = (profileId: Profile['id']): UseProfile => {
  const profile = useSelector((state: RootState) => state[namespace][profileBase].profiles[profileId]?.data);

  return {
    profile,
    ...useProfileLoader(profileId),
  };
};
