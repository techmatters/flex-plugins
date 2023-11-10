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

import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { ProfileRoute, ProfileSectionEditRoute } from '../../states/routing/types';
import { RouterTask } from '../../types/types';
import ProfileEdit from './ProfileEdit';
import ProfileTabs from './ProfileTabs';
import ProfileFlagEditPage from './profileFlag/ProfileFlagEditPage';
import ProfileSectionEdit from './section/ProfileSectionEdit';
import { ProfileCommonProps } from './types';

type OwnProps = {
  task: RouterTask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const PROFILE_ROUTES = {
  profile: {
    routes: ['profile'],
    renderComponent: (props: Props) => <ProfileTabs {...props} />,
  },
  profileEdit: {
    routes: ['profileEdit'],
    renderComponent: (props: Props) => <ProfileEdit {...props} />,
  },
  profileFlagEdit: {
    routes: ['profileFlagEdit'],
    renderComponent: (props: Props) => <ProfileFlagEditPage {...props} />,
  },
  profileSectionEdit: {
    routes: ['profileSectionEdit'],
    renderComponent: (props: Props) => <ProfileSectionEdit {...props} sectionType={props.sectionType} />,
  },
};

export const ALL_PROFILE_ROUTES = Object.values(PROFILE_ROUTES).flatMap(({ routes }) => routes);

const ProfileRouter: React.FC<Props> = props => {
  const { currentRoute, task } = props;

  return (
    Object.values(PROFILE_ROUTES)
      .find(({ routes }) => routes.includes(currentRoute))
      ?.renderComponent(props) || null
  );
};

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const routingState = state[namespace].routing;
  const route = getCurrentTopmostRouteForTask(routingState, taskSid);
  const profileId = (route as ProfileRoute).id;
  const currentRouteStack = getCurrentTopmostRouteForTask(routingState, taskSid);
  const currentRoute = currentRouteStack?.route.toString();
  const sectionType = (currentRouteStack as ProfileSectionEditRoute)?.type;

  return {
    profileId,
    currentRoute,
    sectionType,
  };
};

const connector = connect(mapStateToProps);
export default connector(ProfileRouter);
