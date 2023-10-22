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

import { namespace, profileBase } from '../../states/storeNamespaces';
import * as ProfileActions from '../../states/profile/actions';
import * as profileStateTypes from '../../states/profile/types';
import { RootState } from '../../states';

type ProfileId = profileStateTypes.Profile['id'];

type OwnProps = {
  profileId: ProfileId;
  type: profileStateTypes.ProfileRelationships;
  renderItem: (d: profileStateTypes.ProfileRelationshipTypes) => React.ReactNode;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileRelationships: React.FC<Props> = ({
  data,
  exhausted,
  loadedPage,
  loading,
  page,
  type,
  incrementPage,
  loadRelationshipAsync,
  renderItem,
}) => {
  const hasData = data && data.length > 0;

  useEffect(() => {
    if (loadedPage === page) return;

    loadRelationshipAsync(page);
  }, [page]);

  const renderData = () => {
    if (!hasData) {
      return <div>No {type} found</div>;
    }

    return <>{data.map(d => renderItem(d))}</>;
  };

  const renderLoadMore = () => {
    if (loading) return <div>Loading...</div>;
    if (exhausted) return null;

    return (
      <button type="button" onClick={incrementPage}>
        Load more
      </button>
    );
  };

  return (
    <>
      {renderData()}
      {renderLoadMore()}
    </>
  );
};

const getCurrentProfileState = (state: RootState, profileId: ProfileId, type: profileStateTypes.ProfileRelationships) =>
  state[namespace][profileBase].profiles[profileId][type];

const mapStateToProps = (state: RootState, { profileId, type }) => {
  const { data, exhausted, loadedPage, loading, page } = getCurrentProfileState(state, profileId, type);

  return {
    data,
    loadedPage,
    loading,
    exhausted,
    page,
  };
};

const mapDispatchToProps = (dispatch, { profileId, type }: OwnProps) => ({
  loadRelationshipAsync: (page: number) =>
    dispatch(
      ProfileActions.loadRelationshipAsync({
        profileId,
        type,
        page,
      }),
    ),
  incrementPage: () => dispatch(ProfileActions.incrementPage({ profileId, type })),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(ProfileRelationships);
