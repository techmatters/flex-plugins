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
import { Template } from '@twilio/flex-ui';

import { CustomITask, Profile } from '../../../types/types';
import NavigableContainer from '../../NavigableContainer';
import { DetailsWrapper, ProfileSubtitle } from '../styles';
import ProfileFlagEdit from './ProfileFlagEdit';
import { ProfileCommonProps } from '../types';

type OwnProps = ProfileCommonProps;

const ProfileFlagEditPage = (props: OwnProps) => {
  return (
    <NavigableContainer titleCode="Profile-FlagEditHeader" task={props.task}>
      <DetailsWrapper>
        <ProfileSubtitle>
          <Template code="Profile-StatusHeader" />
        </ProfileSubtitle>
        <ProfileFlagEdit {...props} />
      </DetailsWrapper>
    </NavigableContainer>
  );
};

export default ProfileFlagEditPage;
