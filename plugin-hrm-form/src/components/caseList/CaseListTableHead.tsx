/* eslint-disable react/prop-types */
import React from 'react';
import { TableHead, TableRow } from '@material-ui/core';

import CaseListTableHeadCell from './CaseListTableHeadCell';
import { ListCasesSortBy, ListCasesSortDirection } from '../../types/types';

const CaseListTableHead = () => {
  return (
    <TableHead style={{ boxShadow: '0 1px 2px 0 rgba(25, 43, 51, 0.1)' }} data-testid="CaseList-TableHead">
      <TableRow>
        <CaseListTableHeadCell
          column={ListCasesSortBy.ID}
          defaultSortDirection={ListCasesSortDirection.DESC}
          localizedText="CaseList-THCase"
        />
        <CaseListTableHeadCell
          column={ListCasesSortBy.CHILD_NAME}
          defaultSortDirection={ListCasesSortDirection.ASC}
          localizedText="CaseList-THChildName"
        />
        <CaseListTableHeadCell localizedText="CaseList-THCounselor" />
        <CaseListTableHeadCell localizedText="CaseList-THSummary" width="20%" />
        <CaseListTableHeadCell localizedText="CaseList-THCategory" width="17%" />
        <CaseListTableHeadCell
          column={ListCasesSortBy.CREATED_AT}
          defaultSortDirection={ListCasesSortDirection.DESC}
          localizedText="CaseList-THOpened"
        />
        <CaseListTableHeadCell
          column={ListCasesSortBy.UPDATED_AT}
          defaultSortDirection={ListCasesSortDirection.DESC}
          localizedText="CaseList-THUpdated"
        />
        <CaseListTableHeadCell
          column={ListCasesSortBy.FOLLOW_UP_DATE}
          defaultSortDirection={ListCasesSortDirection.DESC}
          localizedText="CaseList-THFollowUp"
        />
      </TableRow>
    </TableHead>
  );
};

CaseListTableHead.displayName = 'CaseListTableHead';

export default CaseListTableHead;
