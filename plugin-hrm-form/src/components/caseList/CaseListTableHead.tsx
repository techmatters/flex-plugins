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
import { TableHead, TableRow } from '@material-ui/core';

import CaseListTableHeadCell from './CaseListTableHeadCell';
import { ListCasesSortBy, SortDirection } from '../../types/types';
import { TableHeader } from '../../styles';

const CaseListTableHead = () => {
  return (
    <TableHeader data-testid="CaseList-TableHead">
      <TableRow>
        <CaseListTableHeadCell
          column={ListCasesSortBy.ID}
          defaultSortDirection={SortDirection.DESC}
          localizedText="CaseList-THCase"
        />
        <CaseListTableHeadCell
          column={ListCasesSortBy.CHILD_NAME}
          defaultSortDirection={SortDirection.ASC}
          localizedText="CaseList-THChildName"
        />
        <CaseListTableHeadCell localizedText="CaseList-THCounselor" />
        <CaseListTableHeadCell localizedText="CaseList-THSummary" width="20%" />
        <CaseListTableHeadCell localizedText="CaseList-THCategory" width="15%" />
        <CaseListTableHeadCell
          column={ListCasesSortBy.CREATED_AT}
          defaultSortDirection={SortDirection.DESC}
          localizedText="CaseList-THOpened"
        />
        <CaseListTableHeadCell
          column={ListCasesSortBy.UPDATED_AT}
          defaultSortDirection={SortDirection.DESC}
          localizedText="CaseList-THUpdated"
        />
        <CaseListTableHeadCell
          column={ListCasesSortBy.FOLLOW_UP_DATE}
          defaultSortDirection={SortDirection.DESC}
          localizedText="CaseList-THFollowUp"
        />
      </TableRow>
    </TableHeader>
  );
};

CaseListTableHead.displayName = 'CaseListTableHead';

export default CaseListTableHead;
