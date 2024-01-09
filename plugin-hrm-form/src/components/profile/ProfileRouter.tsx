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

import { RouterTask } from '../../types/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { AppRoutes, ProfileRoute, isRouteWithContext } from '../../states/routing/types';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import Router, { RouteConfig, shouldHandleRoute } from '../router/Router';
import ProfileCaseDetails from './ProfileCaseDetails';
import ProfileContactDetails from './ProfileContactDetails';
import ProfileEdit from './ProfileEdit';
import ProfileTabs from './ProfileTabs';
import ProfileSectionEdit from './section/ProfileSectionEdit';

type OwnProps = {
  task: RouterTask;
};

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const routingState = state[namespace].routing;
  const route = getCurrentTopmostRouteForTask(routingState, taskSid);
  const profileId = (route as ProfileRoute).id;

  return {
    profileId,
  };
};

const connector = connect(mapStateToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const PROFILE_ROUTES: RouteConfig<Props> = [
  {
    routes: ['profile'],
    renderComponent: (props: Props) => <ProfileTabs {...props} />,
  },
  {
    routes: ['profileEdit'],
    renderComponent: (props: Props) => <ProfileEdit {...props} />,
  },
  {
    routes: ['profileSectionEdit'],
    renderComponent: (props: Props) => <ProfileSectionEdit {...props} />,
  },
  {
    contextRoutes: ['contact'],
    renderComponent: (props: Props) => <ProfileContactDetails {...props} />,
  },
  {
    contextRoutes: ['case'],
    renderComponent: (props: Props) => <ProfileCaseDetails {...props} />,
  },
];

export const isProfileRoute = (routing: AppRoutes) => shouldHandleRoute(routing, PROFILE_ROUTES, 'profile');

const ProfileRouter: React.FC<Props> = props => {
  return <Router {...props} routeConfig={PROFILE_ROUTES} />;
};

export default connector(ProfileRouter);
