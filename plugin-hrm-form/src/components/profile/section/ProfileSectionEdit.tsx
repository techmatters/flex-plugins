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

import React, { useRef } from 'react';
import { TextField } from '@material-ui/core';

import NavigableContainer from '../../NavigableContainer';
import { CustomITask, Profile, ProfileSection } from '../../../types/types';
import { Flex, StyledNextStepButton } from '../../../styles/HrmStyles';
import { useEditProfileSection, useProfileSection } from '../../../states/profile/hooks/useProfileSection';
import { createProfileSection, getProfileSection } from '../../../services/ProfileService';

type OwnProps = {
  task: CustomITask;
  profileId: Profile['id'];
  sectionId: ProfileSection['id'];
};

type Props = OwnProps;

const ProfileSectionEdit = ({ task, profileId, sectionId }: Props) => {
  profileId = 4;
  // sectionId = 5;
  // createProfileSection(profileId, 'test content 2', 'summary2');
  const section = useProfileSection(profileId, sectionId);

  const editedSection = useEditProfileSection(profileId, sectionId);

  return (
    <NavigableContainer titleCode="Profile-EditNoteHeader" task={task}>
      <TextField multiline rows={40} variant="outlined" />
      <Flex justifyContent="flex-end" flexDirection="row">
        <StyledNextStepButton data-testid="Case-EditCaseScreen-SaveItem" roundCorners onClick={() => null}>
          Save
        </StyledNextStepButton>
      </Flex>
    </NavigableContainer>
  );
};

export default ProfileSectionEdit;
