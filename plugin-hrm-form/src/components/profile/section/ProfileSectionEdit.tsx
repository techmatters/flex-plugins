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

import React, { useRef, useState } from 'react';
import { TextField } from '@material-ui/core';

import NavigableContainer from '../../NavigableContainer';
import { ProfileSection } from '../../../types/types';
import { Flex, StyledNextStepButton } from '../../../styles/HrmStyles';
import { useEditProfileSection } from '../../../states/profile/hooks/useProfileSection';
import { ProfileCommonProps } from '../types';
import FieldText from '../../FieldText';

type OwnProps = ProfileCommonProps & {
  sectionType: ProfileSection['sectionType'];
};

type Props = OwnProps;

const ProfileSectionEdit = ({ task, profileId, sectionType }: Props) => {
  const { section, createProfileSection, updateProfileSection } = useEditProfileSection({ profileId, sectionType });

  const [content, setContent] = useState<string>(section?.content || '');
  const sectionId: ProfileSection['id'] = section?.id;

  const handleEdit = () => {
    if (!sectionId) {
      return createProfileSection({ profileId, sectionType, content });
    }
    return updateProfileSection({ profileId, sectionType, content, sectionId });
  };

  return (
    <NavigableContainer titleCode="Profile-EditNoteHeader" task={task}>
      <TextField
        multiline
        minRows={40}
        variant="outlined"
        defaultValue={content}
        onChange={e => setContent(e.target.value)}
      />
      {/* <FieldText id={sectionId.toString()} field="textarea" /> */}
      <Flex justifyContent="flex-end" flexDirection="row">
        <StyledNextStepButton roundCorners onClick={handleEdit}>
          Save
        </StyledNextStepButton>
      </Flex>
    </NavigableContainer>
  );
};

export default ProfileSectionEdit;
