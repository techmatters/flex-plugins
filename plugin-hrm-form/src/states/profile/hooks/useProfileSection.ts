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
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import asyncDispatch from '../../asyncDispatch';
import { ProfileSection } from '../types';
import * as ProfileActions from '../profiles';
import * as ProfileSelectors from '../selectors';
import { RootState } from '../..';
import { UseProfileCommonParams } from './types';

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

  const loadProfileSectionAsync = useCallback(
    (params: ProfileActions.LoadProfileSectionAsyncParams) => {
      asyncDispatch(dispatch)(ProfileActions.loadProfileSectionAsync(params));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!sectionId) return;

    loadProfileSectionAsync({ profileId, sectionType, sectionId });
  }, [profileId, sectionId, sectionType, loadProfileSectionAsync]);

  const loading = useSelector(
    (state: RootState) => ProfileSelectors.selectProfileSectionByType(state, profileId, sectionType)?.loading,
  );
  const error = useSelector(
    (state: RootState) => ProfileSelectors.selectProfileSectionByType(state, profileId, sectionType)?.error,
  );

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

  return {
    section,
    ...useProfileSectionLoaderByType({ profileId, sectionType }),
  };
};

type UseEditProfileSection = {
  section: ProfileSection;
  createProfileSection: (params: ProfileActions.CreateProfileSectionAsyncParams) => void;
  updateProfileSection: (params: ProfileActions.UpdateProfileSectionAsyncParams) => void;
};

export const useEditProfileSection = (params: ProfileActions.ProfileSectionCommonParams): UseEditProfileSection => {
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
