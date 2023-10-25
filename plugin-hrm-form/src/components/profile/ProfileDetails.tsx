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

import { Profile } from '../../types/types';
import { RootState } from '../../states';
import { getCurrentProfileState } from '../../states/profile/selectors';
import { DetailsWrapper, EditButton, ProfileSubtitle, StatusLabelPill } from './styles';
import { Bold, Box, Column } from '../../styles/HrmStyles';

type OwnProps = {
  profileId: Profile['id'];
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileDetails: React.FC<Props> = ({ profileId, profile }) => {
  console.log('ProfileDetails', profile, profileId);

  // TEMP
  // const labels = ['Abusive', 'Blocked'];
  let labels;
  const editButton = true;

  const handleEditProfileDetails = () => {
    console.log('>>>Edit Profile Details');
    if(editButton){
      //openProfileModal(id);
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

      <br />
      <ProfileSubtitle>Identifiers</ProfileSubtitle>
      {profile.identifiers ? (
        profile.identifiers.map(identifier => <div key={identifier.id}>{identifier.identifier}</div>)
      ) : (
        <div>No identifiers found</div>
      )}

      <br />

      <ProfileSubtitle>Status</ProfileSubtitle>
      <div>
        {labels ? (
          labels.map(label => (
            <StatusLabelPill key={label} fillColor="#F5EEF4" blocked={label === 'Blocked'}>
              {label}
            </StatusLabelPill>
          ))
        ) : (
          <StatusLabelPill>None Listed</StatusLabelPill>
        )}
      </div>
      <hr />
    </DetailsWrapper>
  );
};

const mapStateToProps = (state: RootState, { profileId }) => {
  const currentProfileState = getCurrentProfileState(state, profileId);
  const { data: profile } = currentProfileState;

  return {
    profile,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { task } = ownProps;
  const taskId = task.taskSid;

  return {
    
    // openProfileModal: id => {
    //   dispatch(newOpenModalAction({ route: 'profile', id }, taskId));
    // },
    
  };
};


const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ProfileDetails);
