/* eslint-disable react/prop-types */
import React from 'react';
import { TableHead, TableRow } from '@material-ui/core';

import CaseListTableHeadCell from './CaseListTableHeadCell';
import { GetCasesSortBy, GetCasesSortDirection } from '../../types/types';

const CaseListTableHead = ({ sortBy, sortDirection, handleColumnClick }) => {
  const tableCellProps = {
    sortBy,
    sortDirection,
    handleColumnClick,
  };

  return (
    <TableHead style={{ boxShadow: '0 1px 2px 0 rgba(25, 43, 51, 0.1)' }} data-testid="CaseList-TableHead">
      <TableRow>
        <CaseListTableHeadCell
          {...tableCellProps}
          column={GetCasesSortBy.ID}
          defaultSortDirection={GetCasesSortDirection.DESC}
          localizedText="CaseList-THCase"
        />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THChildName" />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THSummary" width="30%" />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THCounselor" />
        <CaseListTableHeadCell
          {...tableCellProps}
          column={GetCasesSortBy.CREATED_AT}
          defaultSortDirection={GetCasesSortDirection.DESC}
          localizedText="CaseList-THOpened"
        />
        <CaseListTableHeadCell
          {...tableCellProps}
          column={GetCasesSortBy.UPDATED_AT}
          defaultSortDirection={GetCasesSortDirection.DESC}
          localizedText="CaseList-THUpdated"
        />
        <CaseListTableHeadCell
          {...tableCellProps}
          column={GetCasesSortBy.FOLLOW_UP_DATE}
          defaultSortDirection={GetCasesSortDirection.DESC}
          localizedText="CaseList-THFollowUp"
        />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THCategory" width="30%" />
        <CaseListTableHeadCell {...tableCellProps} width="4%" />
      </TableRow>
    </TableHead>
  );
};

CaseListTableHead.displayName = 'CaseListTableHead';

export default CaseListTableHead;
