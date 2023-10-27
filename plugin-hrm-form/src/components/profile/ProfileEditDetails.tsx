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
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { RootState } from '../../states';
import { getCurrentProfileState } from '../../states/profile/selectors';
import { CustomITask, Profile } from '../../types/types';
import { DetailsWrapper, EditButton, ProfileSubtitle, StatusLabelPill } from './styles';
import { Bold, Box, Column } from '../../styles/HrmStyles';
import NavigableContainer from '../NavigableContainer';
import { useProfileFlags } from '../../states/profile/hooks';

type OwnProps = {
  profileId: Profile['id'];
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

export const ProfileEditDetails: React.FC<Props> = ({ task, profileId }) => {
  const { profileFlags, associateProfileFlag, disassociateProfileFlag } = useProfileFlags(profileId);
  // TEMP
  // const labels = ['Abusive', 'Blocked'];
  console.log('>>> ProfileEditDetails', task, profileId);
  return (
    <NavigableContainer titleCode="Profile-DetailsHeader" task={task}>
      <DetailsWrapper>
        <Column>
          <Bold>
            <Template code="Profile-DetailsHeader" />
          </Bold>
        </Column>
        <br />
        <ProfileSubtitle>Identifiers</ProfileSubtitle>
        <br />
        <ProfileSubtitle>Status</ProfileSubtitle>
      </DetailsWrapper>
    </NavigableContainer>
  );
};
