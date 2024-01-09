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

import React, { useState, useEffect } from 'react';
import { CircularProgress, TableBody, TableCell } from '@material-ui/core';

import Pagination from '../pagination';
import { DataTableRow, ErrorText, StandardTable, TableContainer } from '../../styles';
import { useProfileList } from '../../states/profile/hooks/useProfileList';
import { useProfileListLoader } from '../../states/profile/hooks/useProfileListLoader';
import ProfileListTableHeader from './ProfileHeader';
import ProfileRow from './ProfileDetailsRow';

const PROFILES_PER_PAGE = 10;

const ProfileListTable: React.FC = () => {
  const { loading, profileIds, profileCount, error } = useProfileList();
  const [currentPage, setCurrentPage] = useState(0);
  const pagesCount = Math.ceil(profileCount / PROFILES_PER_PAGE);
  const offset = currentPage * PROFILES_PER_PAGE;

  console.log('>>> 1 ProfileListTable', { offset, limit: PROFILES_PER_PAGE, profileCount, pagesCount });
  const { loadProfileList } = useProfileListLoader({ skipAutoload: false, offset, limit: PROFILES_PER_PAGE });

  const updatePage = (page: number) => {
    const newoffset = currentPage * PROFILES_PER_PAGE;

    setCurrentPage(page);
    console.log('>>> ProfileListTable updatePage', { newoffset, page, profileCount });
    loadProfileList();
  };

  return (
    <>
      <TableContainer>
        <StandardTable>
          <ProfileListTableHeader />
          {error && <ErrorText>Please try again later {error}</ErrorText>}
          {loading && (
            <TableBody>
              <DataTableRow>
                <TableCell>
                  <CircularProgress size={50} />
                </TableCell>
              </DataTableRow>
            </TableBody>
          )}
          {!loading && (
            <TableBody>
              {profileIds?.length > 0
                ? profileIds?.map(profileId => <ProfileRow key={profileId} profileId={profileId} />)
                : 'No clients found.'}
            </TableBody>
          )}
        </StandardTable>
      </TableContainer>
      {!loading && <Pagination transparent page={currentPage} pagesCount={pagesCount} handleChangePage={updatePage} />}
    </>
  );
};

export default ProfileListTable;
