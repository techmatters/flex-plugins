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
 */ /**
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
import type { ProfileSectionDefinition } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';

import { HiddenText } from '../../../styles';
import { useProfileSectionByType } from '../../../states/profile/hooks';
import ProfileSectionView from './ProfileSectionView';
import type { ProfileCommonProps } from '../types';
import ProfileDetailsSection from './ProfileDetailsSection';
import { ProfileSectionEditButton } from '../styles';

type OwnProps = ProfileCommonProps & {
  sectionType: ProfileSectionDefinition;
  titleCode: string;
  handleEdit: () => void;
};

const ProfileSectionGroup = ({ profileId, sectionType, task, titleCode, handleEdit }: OwnProps) => {
  const { canCreate, canEdit, canView, section } = useProfileSectionByType({
    profileId,
    sectionType: sectionType.name,
  });

  if (!canView) {
    return null;
  }

  const renderEditButton = () => {
    if (!section?.id && !canCreate) return null;

    if (section?.id && !canEdit) return null;

    return (
      <ProfileSectionEditButton onClick={handleEdit}>
        <Template code="Profile-EditButton" />
        <HiddenText>
          <Template code={titleCode} />{' '}
        </HiddenText>
      </ProfileSectionEditButton>
    );
  };

  return (
    <ProfileDetailsSection titleCode={titleCode} editButton={renderEditButton()}>
      <ProfileSectionView profileId={profileId} task={task} sectionType={sectionType} />
    </ProfileDetailsSection>
  );
};

export default ProfileSectionGroup;
