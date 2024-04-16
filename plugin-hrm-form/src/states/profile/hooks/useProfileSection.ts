/* eslint-disable import/order */
/* eslint-disable import/no-unused-modules */
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
import * as ProfileActions from '../profiles';
import * as ProfileSelectors from '../selectors';
import { RootState } from '../..';
import { UseProfileCommonParams } from './types';
import { PermissionActions, getInitializedCan } from '../../../permissions';
import { useLoadWithRetry } from '../../hooks/useLoadWithRetry';

export type UseProfileSectionByType = UseProfileCommonParams & {
  sectionType: string;
};

export const useProfileSectionLoaderByType = ({ profileId, sectionType }: UseProfileSectionByType) => {
  const dispatch = useDispatch();
  // We need the profile section out of the profile data to use it in the useEffect below
  const profileSection = useSelector((state: RootState) =>
    ProfileSelectors.selectProfileSectionFromProfileByType(state, profileId, sectionType),
  );
  const sectionId = profileSection?.id;

  const loading = useSelector(
    (state: RootState) => ProfileSelectors.selectProfileSectionByType(state, profileId, sectionType)?.loading,
  );
  const error = useSelector((state: RootState) =>
    ProfileSelectors.selectProfileSectionByType(state, profileId, sectionType),
  )?.error;

  const loadProfileSectionAsync = useCallback(() => {
    asyncDispatch(dispatch)(ProfileActions.loadProfileSectionAsync({ profileId, sectionType, sectionId }));
  }, [dispatch, profileId, sectionId, sectionType]);

  const safeToLoad = Boolean(sectionId);
  const shouldLoad = true;

  useLoadWithRetry({
    loadFunction: loadProfileSectionAsync,
    error,
    loading,
    retry: true,
    safeToLoad,
    shouldLoad,
  });

  return {
    loading,
    error,
    loadProfileSectionAsync,
  };
};

export const useProfileSectionByType = ({ profileId, sectionType }: UseProfileSectionByType) => {
  const section = useSelector(
    (state: RootState) => ProfileSelectors.selectProfileSectionByType(state, profileId, sectionType)?.data,
  );

  const can = useMemo(() => {
    return getInitializedCan();
  }, []);

  return {
    section,
    canCreate: can(PermissionActions.CREATE_PROFILE_SECTION, section || { sectionType }),
    canView: can(PermissionActions.VIEW_PROFILE_SECTION, section || { sectionType }),
    canEdit: section && can(PermissionActions.EDIT_PROFILE_SECTION, section),
    ...useProfileSectionLoaderByType({ profileId, sectionType }),
  };
};

export const useEditProfileSection = (params: ProfileActions.ProfileSectionCommonParams) => {
  const dispatch = useDispatch();

  const profileSection = useProfileSectionByType(params);

  const createProfileSection = useCallback(
    (params: ProfileActions.CreateProfileSectionAsyncParams) => {
      asyncDispatch(dispatch)(ProfileActions.createProfileSectionAsync(params));
    },
    [dispatch],
  );

  const updateProfileSection = useCallback(
    (params: ProfileActions.UpdateProfileSectionAsyncParams) => {
      asyncDispatch(dispatch)(ProfileActions.updateProfileSectionAsync(params));
    },
    [dispatch],
  );

  return {
    ...profileSection,
    createProfileSection,
    updateProfileSection,
  };
};
