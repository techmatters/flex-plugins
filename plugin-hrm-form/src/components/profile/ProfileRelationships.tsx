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
import { connect } from 'react-redux';

import { namespace, profileBase } from '../../states/storeNamespaces';
import * as ProfileActions from '../../states/profile/actions';
import * as profileStateTypes from '../../states/profile/types';
import * as RoutingActions from '../../states/routing/actions';
import { RootState } from '../../states';

type ProfileId = profileStateTypes.Profile['id'];

type OwnProps = {
  profileId: ProfileId;
  type: profileStateTypes.ProfileRelationships;
  data: profileStateTypes.ProfileRelationshipTypes[];
  loading: boolean;
  renderItem: (d: profileStateTypes.ProfileRelationshipTypes) => React.ReactNode;
  loadRelationshipAsync: (profileId: ProfileId) => void;
};

type Props = OwnProps;

const ProfileRelationships: React.FC<Props> = ({
  profileId,
  type,
  data,
  loading,
  renderItem,
  loadRelationshipAsync,
}) => {
  useEffect(() => {
    loadRelationshipAsync(profileId);
  }, [profileId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const hasData = data && data.length > 0;

  if (!hasData) {
    return <div>No ${type} found</div>;
  }

  return <>{data.map(d => renderItem(d))}</>;
};

const mapStateToProps = (state: RootState, ownProps) => {
  const profileState = state[namespace][profileBase];
  const { profileId, type } = ownProps;
  const currentProfileState = profileState.profiles[profileId];

  const { data, loading } = currentProfileState[type];

  return {
    loading,
    data,
    profileId,
  };
};

const mapDispatchToProps = (dispatch, { type }: OwnProps) => ({
  loadRelationshipAsync: (profileId: ProfileId) =>
    dispatch(
      ProfileActions.loadRelationshipAsync({
        profileId,
        type: 'contacts',
      }),
    ),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileRelationships);
