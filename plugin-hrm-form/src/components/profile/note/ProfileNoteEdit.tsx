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
import { CustomITask, Profile, ProfileNote } from '../../../types/types';
import { Flex, StyledNextStepButton } from '../../../styles/HrmStyles';
import { ProfileCommonProps } from '../types';

type OwnProps = ProfileCommonProps;

type Props = OwnProps;

const ProfileNoteEdit = ({ task }: Props) => {
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

export default ProfileNoteEdit;
