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

import ProfileTabs from './ProfileTabs';
import ProfileFlagEditPage from './profileFlag/ProfileFlagEditPage';
import ProfileSectionEdit from './section/ProfileSectionEdit';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { ProfileRoute } from '../../states/routing/types';
import { CustomITask } from '../../types/types';
import ProfileEdit from './ProfileEdit';

type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Profile: React.FC<Props> = ({ task, profileId, currentRoute }) => {
  const profileProps = {
    task,
    profileId,
  };

  const routes = [
    {
      routes: ['profileEdit'],
      component: <ProfileEdit {...profileProps} />,
    },
    {
      routes: ['profileFlagEdit'],
      component: <ProfileFlagEditPage {...profileProps} />,
    },
    {
      routes: ['profileSectionEdit'],
      component: <ProfileSectionEdit {...profileProps} sectionId={1} />,
    },
    {
      routes: ['profile'],
      component: <ProfileTabs {...profileProps} />,
    },
  ];

  return routes.find(({ routes }) => routes.includes(currentRoute))?.component || null;
};

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const routingState = state[namespace].routing;
  const route = getCurrentTopmostRouteForTask(routingState, taskSid);
  const profileId = (route as ProfileRoute).id;
  const currentRoute = getCurrentTopmostRouteForTask(routingState, taskSid)?.route.toString();

  return {
    profileId,
    currentRoute,
  };
};

const connector = connect(mapStateToProps);
export default connector(Profile);
