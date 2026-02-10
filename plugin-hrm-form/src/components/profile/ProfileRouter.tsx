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
import { useSelector } from 'react-redux';

import { RouterTask, Profile } from '../../types/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { AppRoutes, ProfileRoute } from '../../states/routing/types';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import Router, { RouteConfig, shouldHandleRoute } from '../router/Router';
import ProfileCaseDetails from './ProfileCaseDetails';
import ProfileContactDetails from './ProfileContactDetails';
import ProfileEdit from './ProfileEdit';
import ProfileTabs from './ProfileTabs';
import ProfileSectionEdit from './section/ProfileSectionEdit';

type Props = {
  task: RouterTask;
};

type ProfileRouterProps = Props & {
  profileId: Profile['id'];
};

const PROFILE_ROUTES: RouteConfig<ProfileRouterProps> = [
  {
    routes: ['profile'],
    renderComponent: (props: ProfileRouterProps) => <ProfileTabs {...props} />,
  },
  {
    routes: ['profileEdit'],
    renderComponent: (props: ProfileRouterProps) => <ProfileEdit {...props} />,
  },
  {
    routes: ['profileSectionEdit'],
    renderComponent: (props: ProfileRouterProps) => {
      return <ProfileSectionEdit {...props} />;
    },
  },
  {
    contextRoutes: ['contact'],
    renderComponent: (props: ProfileRouterProps) => <ProfileContactDetails {...props} />,
  },
  {
    contextRoutes: ['case'],
    renderComponent: (props: ProfileRouterProps) => <ProfileCaseDetails {...props} />,
  },
];

export const isProfileRoute = (routing: AppRoutes) => shouldHandleRoute(routing, PROFILE_ROUTES, 'profile');

const ProfileRouter: React.FC<Props> = props => {
  const profileId = useSelector((state: RootState) => {
    const routingState = state[namespace].routing;
    const route = getCurrentTopmostRouteForTask(routingState, props.task.taskSid);
    return (route as ProfileRoute).profileId;
  });

  const routerProps: ProfileRouterProps = { ...props, profileId };

  return <Router {...routerProps} routeConfig={PROFILE_ROUTES} />;
};

export default ProfileRouter;
