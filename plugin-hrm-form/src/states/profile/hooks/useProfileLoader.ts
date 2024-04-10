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
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLoadWithRetry } from '../../hooks/useLoadWithRetry';
import { RootState } from '../..';
import asyncDispatch from '../../asyncDispatch';
import * as ProfileActions from '../profiles';
import * as ProfileSelectors from '../selectors';
import { UseProfileCommonParams } from './types';

type UseProfileLoaderParams = UseProfileCommonParams & { autoload?: boolean; refresh?: boolean };

type UseProfileLoaderReturn = {
  error?: any;
  loading: boolean;
  loadProfile: () => void;
};

/**
 * Tools to load a profile by id into redux, by default it will load the profile automatically
 * @param {UseProfileLoaderParams} params - Parameters for the hook
 * @param params.profileId - The id of the profile to load
 * @param params.autoload - If true, the profile will be loaded automatically (default: true)
 * @param params.refresh - If changed to true, triggers a re-load (default: false)
 * @returns {UseProfileLoaderReturn} - loading state and actions for the profile
 */
export const useProfileLoader = ({
  profileId,
  autoload = true,
  refresh = false,
}: UseProfileLoaderParams): UseProfileLoaderReturn => {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => ProfileSelectors.selectProfileById(state, profileId)?.error);
  const loading = useSelector((state: RootState) => ProfileSelectors.selectProfileById(state, profileId)?.loading);
  const data = useSelector((state: RootState) => ProfileSelectors.selectProfileById(state, profileId)?.data);

  const loadProfile = useCallback(() => {
    asyncDispatch(dispatch)(ProfileActions.loadProfileAsync(profileId));
  }, [dispatch, profileId]);

  const firstFetch = autoload && !loading && !data && !error;
  const safeToLoad = Boolean(profileId); // prevent load if there's no profile id
  const shouldLoad = firstFetch || refresh; // load on initial mount

  useLoadWithRetry({
    error,
    loadFunction: loadProfile,
    loading,
    retry: true,
    safeToLoad,
    shouldLoad,
  });

  return {
    error,
    loading,
    loadProfile,
  };
};
