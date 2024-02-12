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
import { Template } from '@twilio/flex-ui';
import { ArrowDownward } from '@material-ui/icons';
import { useDispatch } from 'react-redux';

import { ProfilesListSortBy, SortDirection } from '../../types/types';
import { TableHeaderFont, HeaderCell } from '../../styles';
import { useProfilesList } from '../../states/profile/hooks';
import { updateProfileListSettings } from '../../states/profile/profilesList';

const defaultSortDirection = SortDirection.DESC;

const changeSortDirection = (sortDirection: SortDirection): SortDirection =>
  sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;

type OwnProps = {
  column?: ProfilesListSortBy;
  localizedText?: string;
  width?: string;
};

type Props = OwnProps;

/**
 * If column prop is filled, the cell will enable sorting by this column
 */
const ProfileHeaderCell: React.FC<Props> = ({ column, localizedText, width }) => {
  const { settings } = useProfilesList();
  const dispatch = useDispatch();

  const {
    sort: { sortBy, sortDirection },
  } = settings;

  const drawSort = () => {
    if (!sortBy || !column || column !== sortBy) return null;

    return (
      <ArrowDownward
        style={{
          fontSize: 16,
          marginLeft: '10px',
          verticalAlign: 'middle',
          transform: sortDirection === SortDirection.ASC ? 'rotate(180deg) scaleX(-1)' : 'none',
        }}
      />
    );
  };

  const borderBottom = () => (sortBy === column ? '3px solid #000000' : 'none');

  const cursor = () => (column ? 'pointer' : 'auto');

  const handleClick = async () => {
    if (!column) return;

    const isDifferentColumn = column !== sortBy;
    const updatedSortDirection = isDifferentColumn ? defaultSortDirection : changeSortDirection(sortDirection);

    dispatch(updateProfileListSettings({ sort: { sortBy: column, sortDirection: updatedSortDirection } }));
  };

  return (
    <HeaderCell
      style={{ width: width || '10%', cursor: cursor() }}
      align="right"
      variant="head"
      scope="col"
      onClick={column && handleClick}
    >
      <TableHeaderFont style={{ borderBottom: borderBottom() }}>
        <Template code={localizedText} />
        <span aria-hidden="true">{drawSort()}</span>
      </TableHeaderFont>
    </HeaderCell>
  );
};

ProfileHeaderCell.displayName = 'ProfileHeaderCell';

export default ProfileHeaderCell;
