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
import ProfileListHeaderCell from './ProfileListHeaderCell';

const ProfileListHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <ProfileListHeaderCell localizedText="ProfileList-THClient" width="5%" />
        <ProfileListHeaderCell localizedText="ProfileList-THStatus" width="8%" />
        <ProfileListHeaderCell localizedText="ProfileList-THIdentifier" width="10%" />
        <ProfileListHeaderCell localizedText="ProfileList-THSummary" width="20%" />
      </TableRow>
    </TableHeader>
  );
};

export default ProfileListHeader;
