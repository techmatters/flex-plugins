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
import { Profile, ProfileSection } from '../types';
import * as ProfileActions from '../profiles';
import * as ProfileSelectors from '../selectors';
import { RootState } from '../..';

export type useProfileSectionByType = {
  profileId: Profile['id'];
  sectionType: string;
};

export const useProfileSectionLoaderByType = ({ profileId, sectionType }: useProfileSectionByType) => {
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
  }, [profileId, sectionType, sectionId, profileSection]);

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

export const useProfileSectionByType = ({ profileId, sectionType }: useProfileSectionByType) => {
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
  const { profileId } = params;

  const profileSection = useProfileSectionByType(params);
  // const section = profileSection.section;
  // const sectionId = section?.id;

  const createProfileSection = useCallback(
    (params: ProfileActions.CreateProfileSectionAsyncParams) => {
      asyncDispatch(dispatch)(ProfileActions.createProfileSectionAsync(params));
    },
    [dispatch, profileId],
  );

  const updateProfileSection = useCallback(
    (params: ProfileActions.UpdateProfileSectionAsyncParams) => {
      asyncDispatch(dispatch)(ProfileActions.updateProfileSectionAsync(params));
    },
    [dispatch, profileId],
  );

  return {
    ...profileSection,
    createProfileSection,
    updateProfileSection,
  };
};

// probably unused beyond here.

// export const useProfileSection = (profileId: Profile['id'], sectionId): ProfileSection =>
//   useSelector((state: RootState) => ProfileSelectors.selectProfileSectionById(state, profileId, sectionId));

// export const useProfileSections = (profileId: Profile['id']): ProfileSection[] => {
//   const sections = useSelector((state: RootState) => ProfileSelectors.selectAllProfileSections(state, profileId));
//   console.log(`>>> useProfileSections for profileId ${profileId} returning ${sections}`);
//   const sectionsByType = useSelector((state: RootState) =>
//     ProfileSelectors.selectProfileSectionByType(state, profileId, 'summary'),
//   );
//   console.log(`>>> useProfileSections for profileId ${profileId} returning ${sectionsByType}`);
//   return sections;
// };
