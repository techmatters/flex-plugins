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
import * as ProfileActions from '../profile';
import * as ProfileSelectors from '../selectors';
import { RootState } from '../..';

// export const useProfileSectionByType = (profileId: Profile['id'], sectionType: string): ProfileSection => {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     asyncDispatch(dispatch)(ProfileActions.loadProfileSectionAsync(profileId, sectionType));
//   }, [dispatch, profileId, sectionType]);

//   return useSelector((state: RootState) => ProfileSelectors.selectProfileSectionByType(state, profileId, sectionType));
// }

export const useProfileSection = (profileId: Profile['id'], sectionId): ProfileSection =>
  useSelector((state: RootState) => ProfileSelectors.selectProfileSectionById(state, profileId, sectionId));

export const useProfileSections = (profileId: Profile['id']): ProfileSection[] => {
  const sections = useSelector((state: RootState) => ProfileSelectors.selectAllProfileSections(state, profileId));
  console.log(`>>> useProfileSections for profileId ${profileId} returning ${sections}`);
  const sectionsByType = useSelector((state: RootState) =>
    ProfileSelectors.selectProfileSectionByType(state, profileId, 'summary'),
  );
  console.log(`>>> useProfileSections for profileId ${profileId} returning ${sectionsByType}`);
  return sections;
};


type UseEditProfileSection = {
  handleEditProfileSection: (sectionId: string, content: string, sectionType: string) => void;
};

export const useEditProfileSection = (profileId: Profile['id'], sectionId): UseEditProfileSection => {
  const dispatch = useDispatch();

  const section = useProfileSection(profileId, sectionId);

  console.log('>>> useEditProfileSection useProfileSection section', section);

  const createProfileSection = useCallback(
    (content: string, sectionType: string) => {
      asyncDispatch(dispatch)(ProfileActions.createProfileSectionAsync(profileId, content, sectionType));
    },
    [dispatch, profileId],
  );

  const updateProfileSection = useCallback(
    (sectionId: string, content: string) => {
      asyncDispatch(dispatch)(ProfileActions.updateProfileSectionAsync(profileId, sectionId, content));
    },
    [dispatch, profileId],
  );

  const profileSection = useMemo(
    () => ({
      handleEditProfileSection: (sectionId: string, content: string, sectionType: string) => {
        console.log('>>> handleEditProfileSection', sectionId, content, sectionType);

        if (content && sectionType) {
          console.log('>>>Updating profile section', content);
          updateProfileSection(sectionId, content);
        } else {
          console.log('>>>Creating profile section');
          createProfileSection(content, sectionType);
        }
      },
    }),
    [createProfileSection, updateProfileSection],
  );

  return {
    ...profileSection,
  };
};
