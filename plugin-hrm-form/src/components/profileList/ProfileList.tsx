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

import { StandaloneITask } from '../../types/types';
import { ListContainer, StandaloneContainer } from '../../styles';
import ProfileFilters from './filters';
import ProfileListTable from './ProfileListTable';
import ProfileRouter, { isProfileRoute } from '../profile/ProfileRouter';
import { RootState } from '../../states';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';

const standaloneTask: StandaloneITask = {
  taskSid: 'standalone-task-sid',
  attributes: { isContactlessTask: false },
};

type OwnProps = {};

type Props = OwnProps & ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => {
  return {
    routing: selectCurrentTopmostRouteForTask(state, standaloneTask.taskSid) ?? {
      route: 'profile-list',
      subroute: 'profile-list',
    },
  };
};

const ProfileListPage: React.FC<Props> = ({ routing }) => {
  if (isProfileRoute(routing))
    return (
      <StandaloneContainer>
        <ProfileRouter task={standaloneTask} />
      </StandaloneContainer>
    );

  return (
    <ListContainer width="1080px">
      <ProfileFilters />
      <ProfileListTable />
    </ListContainer>
  );
};

const connector = connect(mapStateToProps, null);

// eslint-disable-next-line import/no-unused-modules
export default connector(ProfileListPage);
