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

import asyncDispatch from '../../states/asyncDispatch';
import ProfileTabs from './ProfileTabs';
import * as ProfileActions from '../../states/profile/actions';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { ProfileRoute } from '../../states/routing/types';
import { CustomITask, Profile as ProfileType } from '../../types/types';
import { ProfileEditDetails } from './ProfileEditDetails';

type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Profile: React.FC<Props> = ({ task, profileId, loadProfile, profileEditModalOpen }) => {
  useEffect(() => {
    loadProfile(profileId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  if (profileEditModalOpen) {
    return <ProfileEditDetails task={task} profileId={profileId} />;
  }

  return <ProfileTabs task={task} profileId={profileId} />;
};

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const routingState = state[namespace].routing;
  const route = getCurrentTopmostRouteForTask(routingState, taskSid);
  const profileId = (route as ProfileRoute).id;

  const currentRoute = getCurrentTopmostRouteForTask(routingState, taskSid);

  const profileEditModalOpen = currentRoute.route.toString() === 'profileEdit';

  return {
    profileId,
    profileEditModalOpen,
  };
};

const mapDispatchToProps = (dispatch, { task }: OwnProps) => ({
  loadProfile: profileId => asyncDispatch(dispatch)(ProfileActions.loadProfileAsync(profileId)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Profile);
