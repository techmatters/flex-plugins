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

import React from 'react';
import { ProfileSectionDefinition } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';

import { ProfileCommonProps } from '../types';
import { useProfileSectionByType } from '../../../states/profile/hooks/useProfileSection';
import { ProfileSectionTextContent, SectionText } from '../styles';

type OwnProps = ProfileCommonProps & {
  sectionType: ProfileSectionDefinition;
};

const ProfileSectionView = ({ profileId, sectionType }: OwnProps) => {
  const { section, loading, canView: canViewProfileSection } = useProfileSectionByType({
    profileId,
    sectionType: sectionType.name,
  });

  if (!canViewProfileSection) {
    return null;
  }

  if (loading) {
    return <SectionText>Loading...</SectionText>;
  }

  return (
    <ProfileSectionTextContent hasContent={Boolean(section?.content)}>
      {section?.content?.length > 0 ? (
        section?.content
      ) : (
        <>
          <Template code="Profile-Notes-No" /> {sectionType.label}
        </>
      )}
    </ProfileSectionTextContent>
  );
};

export default ProfileSectionView;
