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
import { Tab as TwilioTab, Template } from '@twilio/flex-ui';

import { useProfile } from '../../states/profile/hooks';
import { useModalRouter } from '../../states/routing/hooks';
import * as RoutingTypes from '../../states/routing/types';
import { StyledTabs } from '../../styles/search'; // just stealing from search until we have a centralized tab style
import NavigableContainer from '../router/NavigableContainer';
import ProfileCases from './ProfileCases';
import ProfileContacts from './ProfileContacts';
import ProfileDetails from './ProfileDetails';
import { ProfileCommonProps } from './types';

type OwnProps = ProfileCommonProps;

type Props = OwnProps;

const ProfileTabs: React.FC<Props> = ({ profileId, task }) => {
  const { activeModalParams, updateModalParams } = useModalRouter(task);
  const { profile: { contactsCount, casesCount } = {} } = useProfile({ profileId, shouldAutoload: true });

  const currentTab = activeModalParams?.tab || 'details';

  const changeProfileTab = (profileId: ProfileCommonProps['profileId'], tab: RoutingTypes.ProfileTabs) => {
    updateModalParams({ profileId, tab });
  };

  const tabs = [
    {
      label: 'Client',
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

export default ProfileTabs;
