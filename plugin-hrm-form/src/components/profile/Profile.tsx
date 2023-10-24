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

import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tab as TwilioTab } from '@twilio/flex-ui';

import asyncDispatch from '../../states/asyncDispatch';
import ProfileCases from './ProfileCases';
import ProfileContacts from './ProfileContacts';
import ProfileDetails from './ProfileDetails';
import { Row } from '../../styles/HrmStyles';
import * as ProfileActions from '../../states/profile/actions';
import * as profileTypes from '../../states/profile/types';
import * as RoutingActions from '../../states/routing/actions';
import { namespace, profileBase } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { Profile as ProfileType } from '../../types/types';
import { StyledTabs } from '../../styles/search'; // just stealing from search until we have a centralized tab style

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Profile: React.FC<Props> = ({ currentTab, profileId, profile, changeProfileTab, loadProfile }) => {
  useEffect(() => {
    loadProfile(profileId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const { contactsCount, casesCount } = profile;
  const tabs = [
    {
      label: 'Details',
      key: 'details',
      component: <ProfileDetails profileId={profileId} />,
    },
    {
      label: `Contacts (${contactsCount})`,
      key: 'contacts',
      component: <ProfileContacts profileId={profileId} />,
    },
    {
      label: `Cases (${casesCount})`,
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
      <div style={{ width: '400px' }}>
        <StyledTabs
          selectedTabName={currentTab}
          onTabSelected={(selectedTab: profileTypes.ProfileTabs) => changeProfileTab(profileId, selectedTab)}
          alignment="center"
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

const mapStateToProps = (state: RootState) => {
  const profileState = state[namespace][profileBase];
  const profileId = profileState.currentProfileId;
  const currentProfileState = profileState.profiles[profileId];

  return {
    currentTab: currentProfileState.currentTab,
    profile: currentProfileState.profile,
    profileId,
  };
};

const mapDispatchToProps = dispatch => ({
  loadProfile: profileId => asyncDispatch(dispatch)(ProfileActions.loadProfileAsync(profileId)),
  changeProfileTab: ProfileActions.changeProfileTab(dispatch),
  changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Profile);
