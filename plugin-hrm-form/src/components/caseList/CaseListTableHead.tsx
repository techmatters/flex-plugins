import React from 'react';
import { TableHead, TableRow } from '@material-ui/core';

import CaseListTableHeadCell from './CaseListTableHeadCell';

const CaseListTableHead = ({ sortBy, order, handleColumnClick }) => {
  const tableCellProps = {
    sortBy,
    order,
    handleColumnClick,
  };

  return (
    <TableHead style={{ boxShadow: '0 1px 2px 0 rgba(25, 43, 51, 0.1)' }} data-testid="CaseList-TableHead">
      <TableRow>
        <CaseListTableHeadCell {...tableCellProps} column="id" localizedText="CaseList-THCase" />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THChildName" />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THSummary" width="30%" />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THCounselor" />
        <CaseListTableHeadCell {...tableCellProps} column="createdAt" localizedText="CaseList-THOpened" />
        <CaseListTableHeadCell {...tableCellProps} column="updatedAt" localizedText="CaseList-THUpdated" />
        <CaseListTableHeadCell {...tableCellProps} column="info.followUpDate" localizedText="CaseList-THFollowUp" />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THCategory" width="30%" />
        <CaseListTableHeadCell {...tableCellProps} width="4%" />
      </TableRow>
    </TableHead>
  );
};

CaseListTableHead.displayName = 'CaseListTableHead';

export default CaseListTableHead;
