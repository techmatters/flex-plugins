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
import { CircularProgress, TableBody, TableCell } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import Pagination from '../pagination';
import { DataTableRow, ErrorText, StandardTable, TableContainer } from '../../styles';
import { useProfilesList } from '../../states/profile/hooks/useProfilesList';
import { useProfilesListLoader } from '../../states/profile/hooks/useProfilesListLoader';
import ProfileListTableHeader from './ProfileHeader';
import ProfileDetailsRow from './ProfileDetailsRow';
import { PAGE_SIZE } from '../../states/profile/profiles';

const ProfileListTable: React.FC = () => {
  const { loading, data: profileIds, count, error, page } = useProfilesList();
  const { updateProfilesListPage } = useProfilesListLoader({ autoload: true });

  const pagesCount = Math.ceil(count / PAGE_SIZE);

  return (
    <>
      <TableContainer>
        <StandardTable>
          <ProfileListTableHeader />
          {error && (
            <TableCell>
              <ErrorText>Please try again later {error}</ErrorText>
            </TableCell>
          )}
          {loading && (
            <TableBody>
              <DataTableRow>
                <TableCell>
                  <CircularProgress size={50} />
                </TableCell>
              </DataTableRow>
            </TableBody>
          )}
          {!loading && profileIds && (
            <TableBody>
              {profileIds.length > 0 ? (
                profileIds.map(profileId => <ProfileDetailsRow key={profileId} profileId={profileId} />)
              ) : (
                <DataTableRow>
                  <TableCell>
                    <Template code="ProfileList-NoClients" />
                  </TableCell>
                </DataTableRow>
              )}
            </TableBody>
          )}
        </StandardTable>
      </TableContainer>
      {!loading && (
        <Pagination transparent page={page} pagesCount={pagesCount} handleChangePage={updateProfilesListPage} />
      )}
    </>
  );
};

export default ProfileListTable;
