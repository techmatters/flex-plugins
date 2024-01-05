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

import React, { useState } from 'react';
import { CircularProgress, TableBody, TableCell } from '@material-ui/core';

import Pagination from '../pagination';
import { DataTableRow, StandardTable, TableContainer } from '../../styles';
import { useProfileList } from '../../states/profile/hooks/useProfileList';
import ProfileListTableHeader from './ProfileHeader';
import ProfileRow from './ProfileDetailsRow';

const PROFILES_PER_PAGE = 10;

const ProfileListTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const updatePage = (page: number) => {
    setCurrentPage(page);
  };

  const { loading, profileIds, profileCount } = useProfileList();
  const pagesCount = Math.ceil(profileCount / PROFILES_PER_PAGE);

  return (
    <>
      <TableContainer>
        <StandardTable>
          <ProfileListTableHeader />
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
              {profileIds?.map(profileId => (
                <ProfileRow key={profileId} profileId={profileId} />
              ))}
            </TableBody>
          )}
        </StandardTable>
      </TableContainer>
      {!loading && <Pagination transparent page={currentPage} pagesCount={pagesCount} handleChangePage={updatePage} />}
    </>
  );
};

export default ProfileListTable;
