import React from 'react';
import { TableHead, TableRow } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { CLTableHeaderFont, CLTableCell } from '../../styles/caseList';

const CaseListTableHead = () => (
  <TableHead data-testid="CaseList-TableHead">
    <TableRow>
      <CLTableCell style={{ width: '8%' }}>
        <CLTableHeaderFont>
          <Template code="CaseList-THCase" />
        </CLTableHeaderFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableHeaderFont>
          <Template code="CaseList-THChildName" />
        </CLTableHeaderFont>
      </CLTableCell>
      <CLTableCell style={{ width: '35%' }}>
        <CLTableHeaderFont>
          <Template code="CaseList-THSummary" />
        </CLTableHeaderFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableHeaderFont>
          <Template code="CaseList-THCounselor" />
        </CLTableHeaderFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableHeaderFont>
          <Template code="CaseList-THOpened" />
        </CLTableHeaderFont>
      </CLTableCell>
      <CLTableCell>
        <CLTableHeaderFont>
          <Template code="CaseList-THUpdated" />
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

CaseListTableHead.displayName = 'CaseListTableHead';

export default CaseListTableHead;
