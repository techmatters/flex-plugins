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

import { useProfile } from '../../../states/profile/hooks';
import { CLTableRow, CLTableCell } from '../../../styles/caseList';

const ProfileListPage: React.FC = () => {
  const { profile: profile4 } = useProfile({ profileId: 4, shouldAutoload: true });
  const { profile: profile5 } = useProfile({ profileId: 5, shouldAutoload: true });

  console.log('>>> ProfileListPage not really ', profile4, profile5);

  return (
    <>
      <h1>Clients</h1>
      <div>
        <CLTableRow>
          <CLTableCell> Client</CLTableCell>
          <CLTableCell> Identifier(s)</CLTableCell>
          <CLTableCell> Status</CLTableCell>
          <CLTableCell> Blocked</CLTableCell>
          <CLTableCell> Overview</CLTableCell>
        </CLTableRow>
      </div>
    </>
  );
};

// eslint-disable-next-line import/no-unused-modules
export default ProfileListPage;
