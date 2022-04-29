/* eslint-disable react/prop-types */
import React from 'react';
import { TableHead, TableRow } from '@material-ui/core';

import CaseListTableHeadCell from './CaseListTableHeadCell';
import { ListCasesSortBy, ListCasesSortDirection } from '../../types/types';

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
          column={ListCasesSortBy.ID}
          defaultSortDirection={ListCasesSortDirection.DESC}
          localizedText="CaseList-THCase"
        />
        <CaseListTableHeadCell
          {...tableCellProps}
          column={ListCasesSortBy.CHILD_NAME}
          defaultSortDirection={ListCasesSortDirection.ASC}
          localizedText="CaseList-THChildName"
        />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THSummary" width="20%" />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THCounselor" />
        <CaseListTableHeadCell
          {...tableCellProps}
          column={ListCasesSortBy.CREATED_AT}
          defaultSortDirection={ListCasesSortDirection.DESC}
          localizedText="CaseList-THOpened"
        />
        <CaseListTableHeadCell
          {...tableCellProps}
          column={ListCasesSortBy.UPDATED_AT}
          defaultSortDirection={ListCasesSortDirection.DESC}
          localizedText="CaseList-THUpdated"
        />
        <CaseListTableHeadCell
          {...tableCellProps}
          column={ListCasesSortBy.FOLLOW_UP_DATE}
          defaultSortDirection={ListCasesSortDirection.DESC}
          localizedText="CaseList-THFollowUp"
        />
        <CaseListTableHeadCell {...tableCellProps} localizedText="CaseList-THCategory" width="20%" />
      </TableRow>
    </TableHead>
  );
};

CaseListTableHead.displayName = 'CaseListTableHead';

export default CaseListTableHead;
