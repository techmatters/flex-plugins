/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { ExpandMore } from '@material-ui/icons';

import { CLTableHeaderFont, CLTableCell } from '../../styles/caseList';
import type { GetCasesParams } from '../../types/types';

type SortDirection = GetCasesParams['sortDirection'];
type SortBy = GetCasesParams['sortBy'];

type Props = {
  column?: SortBy;
  localizedText?: string;
  width?: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  handleColumnClick: (sortBy: SortBy, order: SortDirection) => void;
};

const changeSortDirection = (sortDirection: SortDirection): SortDirection => (sortDirection === 'ASC' ? 'DESC' : 'ASC');

/**
 * If column prop is filled, the cell will enable sorting by this column
 */
const CaseListTableHeadCell: React.FC<Props> = ({
  column,
  localizedText,
  width,
  sortBy,
  sortDirection,
  handleColumnClick,
}) => {
  const drawSort = () => {
    if (column !== sortBy) return null;

    return (
      <ExpandMore
        style={{
          fontSize: 20,
          marginLeft: '10px',
          verticalAlign: 'middle',
          transform: sortDirection === 'ASC' ? 'rotate(180deg) scaleX(-1)' : 'none',
        }}
      />
    );
  };

  const borderBottom = () => (sortBy === column ? '3px solid #009DFF' : 'none');

  const handleClick = async () => {
    if (!column) return;

    const isDifferentColumn = column !== sortBy;
    const updatedSortDirection = isDifferentColumn ? 'DESC' : changeSortDirection(sortDirection);

    await handleColumnClick(column, updatedSortDirection);
  };

  return (
    <CLTableCell style={{ width: width || '8%', cursor: column ? 'pointer' : 'auto' }} onClick={handleClick}>
      <CLTableHeaderFont style={{ borderBottom: borderBottom() }}>
        <Template code={localizedText} /> {drawSort()}
      </CLTableHeaderFont>
    </CLTableCell>
  );
};

CaseListTableHeadCell.displayName = 'CaseListTableHeadCell';

export default CaseListTableHeadCell;
