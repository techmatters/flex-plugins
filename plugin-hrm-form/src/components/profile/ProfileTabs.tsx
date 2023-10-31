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
import { Tab as TwilioTab } from '@twilio/flex-ui';

import NavigableContainer from '../NavigableContainer';
import ProfileCases from './ProfileCases';
import ProfileContacts from './ProfileContacts';
import ProfileDetails from './ProfileDetails';
import { Row } from '../../styles/HrmStyles';
import { useProfile } from '../../states/profile/hooks';
import * as RoutingTypes from '../../states/routing/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import * as RoutingActions from '../../states/routing/actions';
import { namespace, profileBase } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { ProfileRoute } from '../../states/routing/types';
import { RouterTask, Profile } from '../../types/types';
import { StyledTabs } from '../../styles/search'; // just stealing from search until we have a centralized tab style

type OwnProps = {
  profileId: Profile['id'];
  task: RouterTask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileTabs: React.FC<Props> = ({ profileId, task, currentTab, changeProfileTab }) => {
  const { profile: { contactsCount, casesCount } = {} } = useProfile({ profileId, shouldAutoload: true });
  const tabs = [
    {
      label: 'Profile',
      key: 'details',
      component: <ProfileDetails profileId={profileId} task={task} />,
    },
    {
      label: `Contacts (${contactsCount})`,
      key: 'contacts',
      component: <ProfileContacts profileId={profileId} task={task} />,
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
          onTabSelected={(selectedTab: RoutingTypes.ProfileTabs) => changeProfileTab(profileId, selectedTab)}
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
    <NavigableContainer task={task} titleCode="Profile-Title">
      {renderedLabels}
      {renderedTab}
    </NavigableContainer>
  );
};

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const routingState = state[namespace].routing;
  const route = getCurrentTopmostRouteForTask(routingState, taskSid);
  const currentTab = (route as ProfileRoute).subroute || 'contacts';

  return {
    currentTab,
  };
};

const mapDispatchToProps = (dispatch, { task }: OwnProps) => ({
  changeProfileTab: (id, subroute) =>
    dispatch(
      RoutingActions.changeRoute(
        { route: 'profile', id, subroute },
        task.taskSid,
        RoutingTypes.ChangeRouteMode.Replace,
      ),
    ),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ProfileTabs);
