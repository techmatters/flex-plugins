/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { ExpandMore } from '@material-ui/icons';

import { CLTableHeaderFont, CLTableCell } from '../../styles/caseList';
import type { GetCasesParams } from '../../types/types';

type Order = GetCasesParams['order'];
type SortBy = GetCasesParams['sortBy'];

type Props = {
  column?: SortBy;
  localizedText?: string;
  width?: string;
  sortBy: SortBy;
  order: Order;
  handleColumnClick: (sortBy: SortBy, order: Order) => void;
};

const changeOrder = (order: Order): Order => (order === 'ASC' ? 'DESC' : 'ASC');

/**
 * If column prop is filled, the cell will enable sorting by this column
 */
const CaseListTableHeadCell: React.FC<Props> = ({ column, localizedText, width, sortBy, order, handleColumnClick }) => {
  const drawSort = () => {
    if (column !== sortBy) return null;

    return (
      <ExpandMore
        style={{
          fontSize: 20,
          marginLeft: '10px',
          verticalAlign: 'middle',
          transform: order === 'ASC' ? 'rotate(180deg) scaleX(-1)' : 'none',
        }}
      />
    );
  };

  const borderBottom = () => (sortBy === column ? '3px solid #009DFF' : 'none');

  const handleClick = async () => {
    if (!column) return;

    const isDifferentColumn = column !== sortBy;
    const updatedOrder = isDifferentColumn ? 'DESC' : changeOrder(order);

    await handleColumnClick(column, updatedOrder);
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
