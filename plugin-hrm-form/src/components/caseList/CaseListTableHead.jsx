import React from 'react';
import { TableHead, TableRow } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { TableHeaderFont, CaseListTableCell } from '../../styles/caseList';

const CaseListTableHead = () => (
  <TableHead>
    <TableRow>
      <CaseListTableCell>
        <TableHeaderFont>
          <Template code="CaseList-THCase" />
        </TableHeaderFont>
      </CaseListTableCell>
      <CaseListTableCell>
        <TableHeaderFont>
          <Template code="CaseList-THChildName" />
        </TableHeaderFont>
      </CaseListTableCell>
      <CaseListTableCell style={{ width: '35%' }}>
        <TableHeaderFont>
          <Template code="CaseList-THSummary" />
        </TableHeaderFont>
      </CaseListTableCell>
      <CaseListTableCell>
        <TableHeaderFont>
          <Template code="CaseList-THCounselor" />
        </TableHeaderFont>
      </CaseListTableCell>
      <CaseListTableCell>
        <TableHeaderFont>
          <Template code="CaseList-THOpened" />
        </TableHeaderFont>
      </CaseListTableCell>
      <CaseListTableCell>
        <TableHeaderFont>
          <Template code="CaseList-THUpdated" />
        </TableHeaderFont>
      </CaseListTableCell>
      <CaseListTableCell>
        <TableHeaderFont>
          <Template code="CaseList-THCategor" />
        </TableHeaderFont>
      </CaseListTableCell>
      <CaseListTableCell />
    </TableRow>
  </TableHead>
);

CaseListTableHead.displayName = 'CaseListTableHead';

export default CaseListTableHead;
