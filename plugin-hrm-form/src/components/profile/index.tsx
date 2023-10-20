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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tab as TwilioTab } from '@twilio/flex-ui';

import ProfileCases from './ProfileCases';
import ProfileContacts from './ProfileContacts';
import ProfileDetails from './ProfileDetails';
import { Row } from '../../styles/HrmStyles';
import * as ProfileActions from '../../states/profile/actions';
import * as RoutingActions from '../../states/routing/actions';
import { namespace, profileBase } from '../../states';
import { Profile as ProfileType } from '../../types/types';
import { StyledTabs } from '../../styles/search'; // just stealing from search until we have a centralized tab style

type OwnProps = {
  profileId: ProfileType['id'];
  changeProfileTab: (profileId: ProfileType['id'], tabName: string) => void;
  currentTab: string;
};

type Props = OwnProps;

const Profile: React.FC<Props> = ({ changeProfileTab, currentTab, profileId }) => {
  const tabs = [
    {
      label: 'Details',
      key: 'details',
      component: <ProfileDetails profileId={profileId} />,
    },
    {
      label: 'Contacts',
      key: 'contacts',
      component: <ProfileContacts profileId={profileId} />,
    },
    {
      label: 'Cases',
      key: 'cases',
      component: <ProfileCases profileId={profileId} />,
    },
  ];

  const renderedTabs = tabs.map(tab => (
    <TwilioTab key={`ProfileTabs-${profileId}-${tab.key}`} label={tab.label} uniqueName={tab.key}>
      {[]}
    </TwilioTab>
  ));

  const renderedLabels = (
    <Row style={{ justifyContent: 'center' }}>
      <div style={{ width: '300px' }}>
        <StyledTabs
          selectedTabName={currentTab}
          onTabSelected={selectedTab => changeProfileTab(profileId, selectedTab)}
          alignment="left"
          keepTabsMounted={false}
        >
          {renderedTabs}
        </StyledTabs>
      </div>
    </Row>
  );

  const renderedTab = tabs.find(tab => tab.key === currentTab).component;

  return (
    <>
      {renderedLabels}
      {renderedTab}
    </>
  );
};

const mapStateToProps = state => {
  const profileState = state[namespace][profileBase];
  const profileId = profileState.currentProfileId;
  const currentProfileState = profileState.profiles[profileId];

  return {
    currentTab: currentProfileState.currentTab,
    profileId,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeProfileTab: ProfileActions.changeProfileTab(dispatch),
    changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
