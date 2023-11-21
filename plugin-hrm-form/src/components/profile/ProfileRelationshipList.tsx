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

import Pagination from '../Pagination';
import asyncDispatch from '../../states/asyncDispatch';
import * as profileActions from '../../states/profile/actions';
import * as ProfileTypes from '../../states/profile/types';
import * as profileSelectors from '../../states/profile/selectors';
import { PAGE_SIZE } from '../../states/profile/profiles';
import { RootState } from '../../states';

type ProfileId = ProfileTypes.Profile['id'];

type OwnProps = {
  profileId: ProfileId;
  type: ProfileTypes.ProfileRelationships;
  renderItem: (d: ProfileTypes.ProfileRelationshipTypes) => React.ReactNode;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileRelationshipList: React.FC<Props> = ({
  data,
  loadedPage,
  loading,
  page,
  type,
  total,
  updatePage,
  loadRelationshipAsync,
  renderItem,
}) => {
  const hasData = data && data.length > 0;

  useEffect(() => {
    if (loading || hasData) return;
    loadRelationshipAsync(page, loadedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const renderData = () => {
    if (!hasData) {
      return <div>No {type} found</div>;
    }

    return <>{data.map((d: ProfileTypes.ProfileRelationshipTypes) => renderItem(d))}</>;
  };

  const renderPagination = () => {
    if (!hasData) return null;

    const pagesCount = Math.ceil(total / PAGE_SIZE);

    return <Pagination page={page} pagesCount={pagesCount} handleChangePage={updatePage} disabled={loading} />;
  };

  return (
    <>
      {renderData()}
      {renderPagination()}
    </>
  );
};

const mapStateToProps = (state: RootState, { profileId, type }) => {
  const { exhausted, loadedPage, loading, page, total } =
    profileSelectors.selectProfileRelationshipsByType(state, profileId, type) || {};

  const data = profileSelectors.selectProfileRelationshipsByPage(state, {
    profileId,
    type,
    page,
  });

  return {
    data,
    loadedPage,
    loading,
    exhausted,
    page,
    total,
  };
};

const mapDispatchToProps = (dispatch, { profileId, type }: OwnProps) => ({
  loadRelationshipAsync: (page: number, loadedPage: number) =>
    asyncDispatch(dispatch)(
      profileActions.loadRelationshipAsync({
        profileId,
        type,
        page,
        loadedPage,
      }),
    ),
  updatePage: (page: number) =>
    dispatch(
      profileActions.updateRelationshipsPage({
        profileId,
        type,
        page,
      }),
    ),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ProfileRelationshipList);
