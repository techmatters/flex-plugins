import React, { useState } from 'react';
import { TableHead, TableRow } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';
import { ExpandMore } from '@material-ui/icons';

import { CLTableHeaderFont, CLTableCell } from '../../styles/caseList';

const changeOrder = order => (order === 'ASC' ? 'DESC' : 'ASC');

// eslint-disable-next-line react/prop-types
const CaseListTableHead = ({ sortBy, order, handleColumnClick }) => {
  const drawSort = column => {
    if (column !== sortBy) {
      return null;
    }

    return order === 'ASC' ? (
      <ExpandMore
        style={{ fontSize: 20, marginLeft: '10px', verticalAlign: 'middle', transform: 'rotate(180deg) scaleX(-1)' }}
      />
    ) : (
      <ExpandMore style={{ fontSize: 20, marginLeft: '10px', verticalAlign: 'middle' }} />
    );
  };

  const borderBottom = column => (sortBy === column ? '3px solid #009DFF' : 'none');

  const handleClickColumn = async column => {
    const isDifferentColumn = column !== sortBy;
    const updatedOrder = isDifferentColumn ? 'DESC' : changeOrder(order);

    await handleColumnClick(column, updatedOrder);
  };

  return (
    <TableHead style={{ boxShadow: '0 1px 2px 0 rgba(25, 43, 51, 0.1)' }} data-testid="CaseList-TableHead">
      <TableRow>
        <CLTableCell style={{ width: '8%', cursor: 'pointer' }} onClick={() => handleClickColumn('id')}>
          <CLTableHeaderFont style={{ borderBottom: borderBottom('id') }}>
            <Template code="CaseList-THCase" /> {drawSort('id')}
          </CLTableHeaderFont>
        </CLTableCell>
        <CLTableCell>
          <CLTableHeaderFont>
            <Template code="CaseList-THChildName" />
          </CLTableHeaderFont>
        </CLTableCell>
        <CLTableCell style={{ width: '30%' }}>
          <CLTableHeaderFont>
            <Template code="CaseList-THSummary" />
          </CLTableHeaderFont>
        </CLTableCell>
        <CLTableCell>
          <CLTableHeaderFont>
            <Template code="CaseList-THCounselor" />
          </CLTableHeaderFont>
        </CLTableCell>
        <CLTableCell style={{ cursor: 'pointer' }} onClick={() => handleClickColumn('createdAt')}>
          <CLTableHeaderFont style={{ borderBottom: borderBottom('createdAt') }}>
            <Template code="CaseList-THOpened" /> {drawSort('createdAt')}
          </CLTableHeaderFont>
        </CLTableCell>
        <CLTableCell style={{ cursor: 'pointer' }} onClick={() => handleClickColumn('updatedAt')}>
          <CLTableHeaderFont style={{ borderBottom: borderBottom('updatedAt') }}>
            <Template code="CaseList-THUpdated" /> {drawSort('updatedAt')}
          </CLTableHeaderFont>
        </CLTableCell>
        <CLTableCell style={{ cursor: 'pointer' }} onClick={() => handleClickColumn('followUpDate')}>
          <CLTableHeaderFont style={{ borderBottom: borderBottom('followUpDate') }}>
            <Template code="CaseList-THFollowUp" /> {drawSort('followUpDate')}
          </CLTableHeaderFont>
        </CLTableCell>
        <CLTableCell>
          <CLTableHeaderFont>
            <Template code="CaseList-THCategory" />
          </CLTableHeaderFont>
        </CLTableCell>
        <CLTableCell style={{ width: '4%' }} />
      </TableRow>
    </TableHead>
  );
};

CaseListTableHead.displayName = 'CaseListTableHead';

export default CaseListTableHead;
