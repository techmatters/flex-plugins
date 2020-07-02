import React from 'react';
import { TableHead, TableRow } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { TableHeaderFont, CaseListHeadCell } from '../../styles/caseList';

const CaseListTableHead = () => (
  <TableHead>
    <TableRow>
      <CaseListHeadCell>
        <TableHeaderFont>
          <Template code="CaseList-THCase" />
        </TableHeaderFont>
      </CaseListHeadCell>
      <CaseListHeadCell>
        <TableHeaderFont>
          <Template code="CaseList-THChildName" />
        </TableHeaderFont>
      </CaseListHeadCell>
      <CaseListHeadCell style={{ width: '35%' }}>
        <TableHeaderFont>
          <Template code="CaseList-THSummary" />
        </TableHeaderFont>
      </CaseListHeadCell>
      <CaseListHeadCell>
        <TableHeaderFont>
          <Template code="CaseList-THCounselor" />
        </TableHeaderFont>
      </CaseListHeadCell>
      <CaseListHeadCell>
        <TableHeaderFont>
          <Template code="CaseList-THOpened" />
        </TableHeaderFont>
      </CaseListHeadCell>
      <CaseListHeadCell>
        <TableHeaderFont>
          <Template code="CaseList-THUpdated" />
        </TableHeaderFont>
      </CaseListHeadCell>
      <CaseListHeadCell>
        <TableHeaderFont>
          <Template code="CaseList-THCategor" />
        </TableHeaderFont>
      </CaseListHeadCell>
      <CaseListHeadCell />
    </TableRow>
  </TableHead>
);

CaseListTableHead.displayName = 'CaseListTableHead';

export default CaseListTableHead;
