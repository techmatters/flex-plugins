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
import { Template } from '@twilio/flex-ui';
import InfoIcon from '@material-ui/icons/Info';

import Pagination from '../pagination';
import asyncDispatch from '../../states/asyncDispatch';
import * as profileActions from '../../states/profile/actions';
import * as ProfileTypes from '../../states/profile/types';
import * as profileSelectors from '../../states/profile/selectors';
import { PAGE_SIZE } from '../../states/profile/profiles';
import { RootState } from '../../states';
import { SearchResultWarningContainer, Text } from '../search/styles';
import { Row } from '../../styles';

const mapStateToProps = (state: RootState, { profileId, type }) => {
  const { data, loading, page, total } =
    profileSelectors.selectProfileRelationshipsByType(state, profileId, type) || {};

  return {
    data,
    loading,
    page,
    total,
  };
};

const mapDispatchToProps = (dispatch, { profileId, type }: OwnProps) => ({
  loadRelationshipAsync: (page: number) =>
    asyncDispatch(dispatch)(
      profileActions.loadRelationshipAsync({
        profileId,
        type,
        page,
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
type Props = OwnProps & ConnectedProps<typeof connector>;

type ProfileId = ProfileTypes.Profile['id'];

type OwnProps = {
  profileId: ProfileId;
  type: ProfileTypes.ProfileRelationships;
  renderItem: (d: ProfileTypes.ProfileRelationshipTypes) => React.ReactNode;
};

const ProfileRelationshipList: React.FC<Props> = ({
  data,
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
    if (loading) return;
    loadRelationshipAsync(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const renderData = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!hasData && page === 0 && !loading) {
      return (
        <SearchResultWarningContainer>
          <Row style={{ paddingTop: '20px' }}>
            <InfoIcon style={{ color: '#ffc811' }} />
            <Text padding="0" fontWeight="700" margin="20px" color="#282a2b">
              <Template code={type === 'contacts' ? 'Profile-NoContactsFound' : 'Profile-NoCasesFound'} />
            </Text>
          </Row>
        </SearchResultWarningContainer>
      );
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

export default connector(ProfileRelationshipList);
