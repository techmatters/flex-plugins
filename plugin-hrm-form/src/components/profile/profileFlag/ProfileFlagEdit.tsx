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
import { useSelector } from 'react-redux';
import { IconButton } from '@twilio/flex-ui';
import { Paper, Popper } from '@material-ui/core';

import NavigableContainer from '../../NavigableContainer';
import ProfileFlagList from './ProfileFlagList';
import { ProfileSubtitle } from '../styles';
import { Box, Flex, StyledMenuItem } from '../../../styles/HrmStyles';
import { CustomITask, Profile, ProfileFlag } from '../../../types/types';
import { selectProfileAsyncPropertiesById } from '../../../states/profile/selectors';
import { useProfileFlags } from '../../../states/profile/hooks';
import { RootState } from '../../../states';

type OwnProps = {
  profileId: Profile['id'];
  task: CustomITask;
  closeProfileFlagEdit?: () => void;
};

type Props = OwnProps;

const ProfileFlagEdit: React.FC<Props> = ({ profileId, task, closeProfileFlagEdit }: Props) => {
  const { allProfileFlags, profileFlags, associateProfileFlag } = useProfileFlags(profileId);
  const { loading } = useSelector((state: RootState) => selectProfileAsyncPropertiesById(state, profileId));
  const profileFlagsRef = useRef(null);

  const availableFlags = allProfileFlags.filter(flag => !profileFlags.find(f => f.id === flag.id));
  const shouldAllowAssociate = Boolean(availableFlags.length) && !loading;

  const renderAvailableFlags = () =>
    availableFlags.length ? (
      availableFlags.map((flag: ProfileFlag) => (
        <StyledMenuItem key={flag.id} onClick={() => associateProfileFlag(flag.id)}>
          {flag.name}
        </StyledMenuItem>
      ))
    ) : (
      <Box>No flags available</Box>
    );

  return (
    <NavigableContainer titleCode="Profile-EditHeader" task={task}>
      <Flex ref={profileFlagsRef} flexDirection="row" justifyContent="space-between" width="100%">
        <Box alignSelf="center">
          <ProfileFlagList profileId={profileId} task={task} enableDisassociate={true} />
        </Box>
      </Flex>
      <Flex flexDirection="column">
        <Box>
          <ProfileSubtitle>Select a flag to add</ProfileSubtitle>
        </Box>
        {renderAvailableFlags()}
      </Flex>
    </NavigableContainer>
  );
};

export default ProfileFlagEdit;
