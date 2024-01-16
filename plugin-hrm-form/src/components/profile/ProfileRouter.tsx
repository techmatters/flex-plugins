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
import { AppRoutes, ProfileRoute, ProfileSectionEditRoute, isRouteWithContext } from '../../states/routing/types';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
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
  const { profileId } = route as ProfileRoute;
  const currentRouteStack = getCurrentTopmostRouteForTask(routingState, taskSid);
  const currentRoute = currentRouteStack?.route.toString() as AppRoutes['route'];
  const sectionType = (currentRouteStack as ProfileSectionEditRoute)?.type;

  return {
    profileId,
    currentRoute,
    sectionType,
  };
};

const connector = connect(mapStateToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

type ProfileRouteConfig = {
  routes?: AppRoutes['route'][];
  contextRoutes?: AppRoutes['route'][];
  renderComponent: (props: Props) => JSX.Element;
};

const PROFILE_ROUTES: Record<string, ProfileRouteConfig> = {
  profile: {
    routes: ['profile'],
    renderComponent: (props: Props) => <ProfileTabs {...props} />,
  },
  profileContact: {
    contextRoutes: ['contact'],
    renderComponent: (props: Props) => <ProfileContactDetails {...props} />,
  },
  profileCase: {
    contextRoutes: ['case'],
    renderComponent: (props: Props) => <ProfileCaseDetails {...props} />,
  },
  profileEdit: {
    routes: ['profileEdit'],
    renderComponent: (props: Props) => <ProfileEdit {...props} />,
  },
  profileSectionEdit: {
    routes: ['profileSectionEdit'],
    renderComponent: (props: Props) => {
      return <ProfileSectionEdit {...props} sectionType={props.sectionType} />;
    },
  },
};

const rootProfileRoutes = Object.values(PROFILE_ROUTES).flatMap(({ routes }) => routes);
const contextProfileRoutes = Object.values(PROFILE_ROUTES).flatMap(({ contextRoutes }) => contextRoutes);

export const isProfileRoute = (routing: AppRoutes) => {
  if (rootProfileRoutes.includes(routing.route)) return true;

  return (
    isRouteWithContext(routing) &&
    routing.context === 'profile' &&
    contextProfileRoutes.includes(routing.route as AppRoutes['route'])
  );
};

const ProfileRouter: React.FC<Props> = props => {
  const { currentRoute } = props;

  return (
    Object.values(PROFILE_ROUTES)
      .find(({ routes, contextRoutes }) => routes?.includes(currentRoute) || contextRoutes?.includes(currentRoute))
      ?.renderComponent(props) || null
  );
};

export default connector(ProfileRouter);
