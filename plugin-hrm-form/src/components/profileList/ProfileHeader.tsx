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
import { TableRow } from '@material-ui/core';

import { TableHeader } from '../../styles';
import ProfileHeaderCell from './ProfileHeaderCell';
import { ProfilesListSortBy } from '../../types/types';
import { PermissionActions, getInitializedCan } from '../../permissions';

const ProfileHeader: React.FC = () => {
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  return (
    <TableHeader>
      <TableRow>
        <ProfileHeaderCell column={ProfilesListSortBy.ID} localizedText="ProfileList-THClient" />
        <ProfileHeaderCell localizedText="ProfileList-THClientName" />
        <ProfileHeaderCell localizedText="ProfileList-THStatus" />
        {maskIdentifiers ? null : <ProfileHeaderCell localizedText="ProfileList-THIdentifier" />}
        <ProfileHeaderCell localizedText="ProfileList-THSummary" />
      </TableRow>
    </TableHeader>
  );
};

export default ProfileHeader;
