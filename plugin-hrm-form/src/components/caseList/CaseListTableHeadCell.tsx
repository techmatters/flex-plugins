/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { ExpandMore } from '@material-ui/icons';

import { getConfig } from '../../HrmFormPlugin';
import { CLTableHeaderFont, CLTableCell } from '../../styles/caseList';
import { GetCasesParams, GetCasesSortDirection } from '../../types/types';

type SortDirection = GetCasesParams['sortDirection'];
type SortBy = GetCasesParams['sortBy'];

type Props = {
  column?: SortBy;
  defaultSortDirection?: SortDirection;
  localizedText?: string;
  width?: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  handleColumnClick: (sortBy: SortBy, sortDirection: SortDirection) => void;
};

const changeSortDirection = (sortDirection: SortDirection): SortDirection =>
  sortDirection === GetCasesSortDirection.ASC ? GetCasesSortDirection.DESC : GetCasesSortDirection.ASC;

/**
 * If column prop is filled, the cell will enable sorting by this column
 */
const CaseListTableHeadCell: React.FC<Props> = ({
  column,
  defaultSortDirection = GetCasesSortDirection.DESC,
  localizedText,
  width,
  sortBy,
  sortDirection,
  handleColumnClick,
}) => {
  const { featureFlags } = getConfig();

  const drawSort = () => {
    if (!featureFlags.enable_sort_cases) return null;
    if (column !== sortBy) return null;

    return (
      <ExpandMore
        style={{
          fontSize: 20,
          marginLeft: '10px',
          verticalAlign: 'middle',
          transform: sortDirection === GetCasesSortDirection.ASC ? 'rotate(180deg) scaleX(-1)' : 'none',
        }}
      />
    );
  };

  const borderBottom = () => {
    if (!featureFlags.enable_sort_cases) return 'none';
    return sortBy === column ? '3px solid #009DFF' : 'none';
  };

  const cursor = () => {
    if (!featureFlags.enable_sort_cases) return 'auto';
    return column ? 'pointer' : 'auto';
  };

  const handleClick = async () => {
    if (!featureFlags.enable_sort_cases) return;
    if (!column) return;

    const isDifferentColumn = column !== sortBy;
    const updatedSortDirection = isDifferentColumn ? defaultSortDirection : changeSortDirection(sortDirection);

    await handleColumnClick(column, updatedSortDirection);
  };

  return (
    <CLTableCell style={{ width: width || '8%', cursor: cursor() }} onClick={handleClick}>
      <CLTableHeaderFont style={{ borderBottom: borderBottom(), whiteSpace: 'nowrap' }}>
        <Template code={localizedText} /> {drawSort()}
      </CLTableHeaderFont>
    </CLTableCell>
  );
};

CaseListTableHeadCell.displayName = 'CaseListTableHeadCell';

export default CaseListTableHeadCell;
