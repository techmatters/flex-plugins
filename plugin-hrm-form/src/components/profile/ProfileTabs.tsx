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
import { Tab as TwilioTab, Template } from '@twilio/flex-ui';

import { useProfile, useProfileLoader } from '../../states/profile/hooks';
import * as RoutingTypes from '../../states/routing/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import * as RoutingActions from '../../states/routing/actions';
import { namespace } from '../../states/storeNamespaces';
import { StyledTabs } from '../search/styles'; // just stealing from search until we have a centralized tab style
import NavigableContainer from '../NavigableContainer';
import ProfileCases from './ProfileCases';
import ProfileContacts from './ProfileContacts';
import ProfileDetails from './ProfileDetails';
import type { RootState } from '../../states';
import type { ProfileRoute } from '../../states/routing/types';
import type { ProfileCommonProps } from './types';

type OwnProps = ProfileCommonProps;

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const routingState = state[namespace].routing;
  const route = getCurrentTopmostRouteForTask(routingState, taskSid);
  const currentTab = (route as ProfileRoute).subroute || 'details';

  return {
    currentTab,
  };
};

const mapDispatchToProps = (dispatch, { task }: OwnProps) => ({
  changeProfileTab: (id, subroute) =>
    dispatch(
      RoutingActions.changeRoute(
        { route: 'profile', profileId: id, subroute },
        task.taskSid,
        RoutingTypes.ChangeRouteMode.Replace,
      ),
    ),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileTabs: React.FC<Props> = ({ profileId, task, currentTab, changeProfileTab }) => {
  const { profile } = useProfile({ profileId });
  const { contactsCount, casesCount } = profile;
  console.log('>>> ProfileTabs', profile, contactsCount, casesCount);
  useProfileLoader({ profileId });

  const tabs = [
    {
      label: (
        <>
          <Template code="Profile-ClientTab" /> {profileId}
        </>
      ),
      key: 'details',
      renderComponent: () => <ProfileDetails profileId={profileId} task={task} />,
    },
    {
      label: (
        <>
          <Template code="SearchResultsIndex-Contacts" /> ({contactsCount})
        </>
      ),
      key: 'contacts',
      renderComponent: () => <ProfileContacts profileId={profileId} task={task} />,
    },
    {
      label: (
        <>
          <Template code="SearchResultsIndex-Cases" /> ({casesCount})
        </>
      ),
      key: 'cases',
      renderComponent: () => <ProfileCases profileId={profileId} task={task} />,
    },
  ];

  const renderedTabs = tabs.map(tab => (
    <TwilioTab key={`ProfileTabs-${profileId}-${tab.key}`} label={tab.label} uniqueName={tab.key}>
      {tab.renderComponent()}
    </TwilioTab>
  ));

  return (
    <NavigableContainer task={task} titleCode="Profile-Title">
      <StyledTabs
        selectedTabName={currentTab}
        onTabSelected={(selectedTab: RoutingTypes.ProfileTabs) => changeProfileTab(profileId, selectedTab)}
        alignment="center"
        keepTabsMounted={false}
      >
        {renderedTabs}
      </StyledTabs>
    </NavigableContainer>
  );
};

export default connector(ProfileTabs);
