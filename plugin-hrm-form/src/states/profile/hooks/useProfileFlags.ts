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

import { Profile, ProfileFlag } from '../types';
import * as ProfileFlagActions from '../profileFlags';
import { namespace, profileBase } from '../../storeNamespaces';
import { RootState } from '../..';

export type UseAllProfileFlags = {
  allProfileFlags?: ProfileFlag[];
  error?: any;
  loading: boolean;
  loadProfileFlags: () => void;
};

export type UseEditProfileFlags = {
  associateProfileFlag: (profileFlagId: ProfileFlag['id']) => void;
  disassociateProfileFlag: (profileFlagId: ProfileFlag['id']) => void;
};

export type UseProfileFlags = UseAllProfileFlags & UseEditProfileFlags & { profileFlags?: ProfileFlag[] };

/**
 * Access all profile flags for the current account
 * @returns {UseAllProfileFlags} - All profile flags for the current account
 */
export const useAllProfileFlags = (): UseAllProfileFlags => {
  const dispatch = useDispatch();

  const error = useSelector((state: RootState) => state[namespace][profileBase].profileFlags.error);
  const loading = useSelector((state: RootState) => state[namespace][profileBase].profileFlags.loading);
  const allProfileFlags = useSelector((state: RootState) => state[namespace][profileBase].profileFlags.data);

  const loadProfileFlags = useCallback(() => {
    dispatch(ProfileFlagActions.loadProfileFlagsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (!allProfileFlags && !loading) {
      loadProfileFlags();
    }
  }, [allProfileFlags, loading, loadProfileFlags]);

  return {
    allProfileFlags,
    error,
    loading,
    loadProfileFlags,
  };
};

/**
 * Edit profile flags for a specific profile
 * @param profileId
 * @returns {UseEditProfileFlags} - Edit profile flags for a specific profile
 */
export const useEditProfileFlags = (profileId?: Profile['id']): UseEditProfileFlags => {
  const dispatch = useDispatch();

  const associateProfileFlag = useCallback(
    (profileFlagId: ProfileFlag['id']) => {
      if (!profileId) return;
      dispatch(ProfileFlagActions.associateProfileFlagAsync(profileId, profileFlagId));
    },
    [dispatch, profileId],
  );

  const disassociateProfileFlag = useCallback(
    (profileFlagId: ProfileFlag['id']) => {
      if (!profileId) return;
      dispatch(ProfileFlagActions.disassociateProfileFlagAsync(profileId, profileFlagId));
    },
    [dispatch, profileId],
  );

  return {
    associateProfileFlag,
    disassociateProfileFlag,
  };
};

/**
 * Access profile flags for a specific profile, includes all profile flags for the current account and the ability to edit the profile flags for the specific profile
 * @param profileId
 * @returns {UseProfileFlags} - Profile flags for a specific profile and the ability to edit the profile flags for the specific profile
 */
export const useProfileFlags = (profileId?: Profile['id']): UseProfileFlags => {
  const allProfileFlagReturn = useAllProfileFlags();
  const { allProfileFlags } = allProfileFlagReturn;

  const useEditProfileFlagsReturn = useEditProfileFlags(profileId);

  const profileFlagIds = useSelector((state: RootState) =>
    profileId ? state[namespace][profileBase].profiles?.[profileId]?.data?.profileFlags : [],
  );

  const profileFlags = useMemo(() => {
    if (!allProfileFlags || !profileFlagIds) return [];
    return profileFlagIds.map(id => allProfileFlags.find(profileFlag => profileFlag.id === id)).filter(Boolean);
  }, [profileFlagIds, allProfileFlags]);

  return {
    ...allProfileFlagReturn,
    ...useEditProfileFlagsReturn,
    profileFlags,
  };
};
