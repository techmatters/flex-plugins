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

import ProfileFlagsList from './profileFlags/ProfileFlagsList';
import { CustomITask, Profile } from '../../types/types';
import { DetailsWrapper, EditButton, ProfileSubtitle } from './styles';
import { Bold, Box, Column } from '../../styles/HrmStyles';
import { newOpenModalAction } from '../../states/routing/actions';
import { useProfile } from '../../states/profile/hooks';

type OwnProps = {
  profileId: Profile['id'];
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileDetails: React.FC<Props> = ({ profileId, task, openProfileEditModal }) => {
  const { profile } = useProfile(profileId);

  const editButton = true;
  const handleEditProfileDetails = () => {
    if (editButton) {
      openProfileEditModal();
    }
  };

  return (
    <DetailsWrapper>
      <Column>
        <Bold>
          <Template code="Profile-DetailsHeader" />
        </Bold>

        {editButton && (
          <Box alignSelf="flex-end" marginTop="-20px" marginRight="35px">
            <EditButton onClick={handleEditProfileDetails}>
              <Template code="Profile-EditButton" />
            </EditButton>
          </Box>
        )}
      </Column>

      <ProfileSubtitle>Identifiers</ProfileSubtitle>
      {profile.identifiers ? (
        profile.identifiers.map(identifier => <div key={identifier.id}>{identifier.identifier}</div>)
      ) : (
        <div>No identifiers found</div>
      )}
      <ProfileSubtitle>Status</ProfileSubtitle>
      <div>
        <ProfileFlagsList profileId={profileId} task={task} />
      </div>
      <hr />
    </DetailsWrapper>
  );
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => {
  const { profileId, task } = ownProps;
  const taskId = task.taskSid;
  return {
    openProfileEditModal: () => {
      dispatch(newOpenModalAction({ route: 'profileEdit', id: profileId }, taskId));
    },
  };
};

const connector = connect(null, mapDispatchToProps);
export default connector(ProfileDetails);

// TODO:
// - Add a loading state
// - Add Routing for Edit page
