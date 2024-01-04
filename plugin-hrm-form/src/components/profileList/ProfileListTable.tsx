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
import { CircularProgress, TableBody } from '@material-ui/core';

import { DataTableRow, LoadingCell, StandardTable, TableContainer } from '../../styles';
import { useProfileList } from '../../states/profile/hooks/useProfileList';
import ProfileListTableHeader from './ProfileHeader';
import ProfileRow from './ProfileRow';

const ProfileListTable: React.FC = () => {
  const { loading, profileIds } = useProfileList();

  if (loading) {
    return (
      <TableBody>
        <DataTableRow>
          <LoadingCell>
            <CircularProgress size={50} />
          </LoadingCell>
        </DataTableRow>
      </TableBody>
    );
  }

  return (
    <>
      <TableContainer>
        <StandardTable>
          <ProfileListTableHeader />
          {loading && (
            <TableBody>
              <DataTableRow>
                <LoadingCell>
                  <CircularProgress size={50} />
                </LoadingCell>
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
    </>
  );
};

export default ProfileListTable;
