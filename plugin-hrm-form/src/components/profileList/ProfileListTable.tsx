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
import { Template } from '@twilio/flex-ui';
import InfoIcon from '@material-ui/icons/Info';

import Pagination from '../pagination';
import { DataCell, DataTableRow, LoadingCell, StandardTable, TableContainer } from '../../styles';
import { useProfilesList, useProfilesListLoader } from '../../states/profile/hooks';
import { useAllProfileFlags } from '../../states/profile/hooks/useProfileFlags';
import ProfileListTableHeader from './ProfileHeader';
import ProfileDetailsRow from './ProfileDetailsRow';
import { PAGE_SIZE } from '../../states/profile/profiles';

const PROFILES_PER_PAGE = 10;
const ROW_HEIGHT = 89;

const ProfileListTable: React.FC = () => {
  useAllProfileFlags();
  const { loading, data: profileIds, count, page } = useProfilesList();
  const { updateProfilesListPage } = useProfilesListLoader({ autoload: true });

  const pagesCount = Math.ceil(count / PAGE_SIZE);

  console.log('>>> ProfileListTable', loading, count);

  return (
    <>
      <TableContainer>
        <StandardTable>
          <ProfileListTableHeader />
          {loading && (
            <TableBody>
              <DataTableRow
                style={{
                  position: 'relative',
                  background: 'transparent',
                  height: `${(profileIds.length || PROFILES_PER_PAGE) * ROW_HEIGHT}px`,
                }}
              >
                <LoadingCell>
                  <CircularProgress size={50} />
                </LoadingCell>
              </DataTableRow>
            </TableBody>
          )}
          {!loading && profileIds && (
            <TableBody>
              {profileIds.length > 0 ? (
                profileIds.map(profileId => <ProfileDetailsRow key={profileId} profileId={profileId} />)
              ) : (
                <DataTableRow style={{ background: '#fffeef' }}>
                  <DataCell style={{ border: '1px solid #ffc811', verticalAlign: 'middle' }} colSpan={5}>
                    <InfoIcon fontSize="small" style={{ color: '#ffc811', margin: '0 6px -4px 6px' }} />
                    <Template code="ProfileList-NoClients" />
                  </DataCell>
                </DataTableRow>
              )}
            </TableBody>
          )}
        </StandardTable>
      </TableContainer>
      <div style={{ minHeight: '100px' }}>
        {!loading && count > 0 && (
          <Pagination transparent page={page} pagesCount={pagesCount} handleChangePage={updateProfilesListPage} />
        )}
      </div>
    </>
  );
};

export default ProfileListTable;
