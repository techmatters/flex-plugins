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

/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { ArrowDownward } from '@material-ui/icons';
import { connect, ConnectedProps } from 'react-redux';

import { TableHeaderFont, HeaderCell } from '../../styles';
import { ListCasesQueryParams, SortDirection } from '../../types/types';
import * as CaseListSettingsActions from '../../states/caseList/settings';
import { RootState } from '../../states';
import { getAseloFeatureFlags } from '../../hrmConfig';
import { caseListBase, namespace } from '../../states/storeNamespaces';

type SortDirectionParam = ListCasesQueryParams['sortDirection'];
type SortBy = ListCasesQueryParams['sortBy'];

type OwnProps = {
  column?: SortBy;
  defaultSortDirection?: SortDirectionParam;
  localizedText?: string;
  width?: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const changeSortDirection = (sortDirection: SortDirectionParam): SortDirectionParam =>
  sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;

/**
 * If column prop is filled, the cell will enable sorting by this column
 */
const CaseListTableHeadCell: React.FC<Props> = ({
  column,
  defaultSortDirection = SortDirection.DESC,
  localizedText,
  width,
  currentSort,
  updateCaseListSort,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const drawSort = () => {
    if (!currentSort || !column || column !== currentSort.sortBy) return null;

    return (
      <ArrowDownward
        style={{
          fontSize: 16,
          marginLeft: '10px',
          verticalAlign: 'middle',
          transform: currentSort.sortDirection === SortDirection.ASC ? 'rotate(180deg) scaleX(-1)' : 'none',
        }}
      />
    );
  };

  const borderBottom = () => {
    if (!column) return 'none';
    return currentSort?.sortBy === column ? '3px solid #000000' : 'none';
  };

  const cursor = () => (column ? 'pointer' : 'auto');

  const handleClick = async () => {
    if (!column) return;

    const isDifferentColumn = column !== currentSort?.sortBy;
    const updatedSortDirection = isDifferentColumn
      ? defaultSortDirection
      : changeSortDirection(currentSort?.sortDirection);

    updateCaseListSort({ sortBy: column, sortDirection: updatedSortDirection });
  };
  const textAlign = () => {
    if (
      localizedText === 'CaseList-THOpened' ||
      localizedText === 'CaseList-THUpdated' ||
      localizedText === 'CaseList-THFollowUp'
    )
      return 'right';
    return 'left';
  };
  return (
    <HeaderCell
      style={{ width: width || '8%', cursor: cursor() }}
      align="right"
      variant="head"
      onClick={handleClick}
      scope="col"
    >
      <TableHeaderFont style={{ borderBottom: borderBottom(), textAlign: textAlign() }}>
        <Template code={localizedText} />
        <span aria-hidden="true">{drawSort()}</span>
      </TableHeaderFont>
    </HeaderCell>
  );
};

CaseListTableHeadCell.displayName = 'CaseListTableHeadCell';

const mapDispatchToProps = {
  updateCaseListSort: CaseListSettingsActions.updateCaseListSort,
};

const mapStateToProps = (state: RootState) => ({
  currentSort: state[namespace][caseListBase].currentSettings.sort,
  currentSortCompare: JSON.stringify(state[namespace][caseListBase].currentSettings.sort),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CaseListTableHeadCell);

export default connected;
