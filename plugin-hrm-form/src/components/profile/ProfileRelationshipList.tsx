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
import { useDispatch, useSelector } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import InfoIcon from '@material-ui/icons/Info';
import { AnyAction } from 'redux';

import Pagination from '../pagination';
import asyncDispatch from '../../states/asyncDispatch';
import * as profileActions from '../../states/profile/actions';
import * as ProfileTypes from '../../states/profile/types';
import * as profileSelectors from '../../states/profile/selectors';
import { PAGE_SIZE } from '../../states/profile/profiles';
import { RootState } from '../../states';
import { SearchResultWarningContainer, Text } from '../search/styles';
import { Row } from '../../styles';

type ProfileId = ProfileTypes.Profile['id'];

type OwnProps = {
  profileId: ProfileId;
  type: ProfileTypes.ProfileRelationships;
  renderItem: (d: ProfileTypes.ProfileRelationshipTypes) => React.ReactNode;
};

const ProfileRelationshipList: React.FC<OwnProps> = ({ profileId, type, renderItem }) => {
  const dispatch = useDispatch();

  const { data, loading, page, total } =
    useSelector((state: RootState) => profileSelectors.selectProfileRelationshipsByType(state, profileId, type)) || {};

  const hasData = data && data.length > 0;

  useEffect(() => {
    if (loading) return;
    asyncDispatch<AnyAction>(dispatch)(
      profileActions.loadRelationshipAsync({
        profileId,
        type,
        page,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleChangePage = (newPage: number) => {
    dispatch(
      profileActions.updateRelationshipsPage({
        profileId,
        type,
        page: newPage,
      }),
    );
  };

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

    return <Pagination page={page} pagesCount={pagesCount} handleChangePage={handleChangePage} disabled={loading} />;
  };

  return (
    <>
      {renderData()}
      {renderPagination()}
    </>
  );
};

ProfileRelationshipList.displayName = 'ProfileRelationshipList';

export default ProfileRelationshipList;
