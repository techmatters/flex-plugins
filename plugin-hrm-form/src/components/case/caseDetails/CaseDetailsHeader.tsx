/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import {
  DetailsHeaderContainer,
  DetailsHeaderChildName,
  DetailsHeaderCaseContainer,
  DetailsHeaderCaseId,
  DetailsHeaderOfficeName,
  DetailsHeaderCounselor,
} from '../../../styles/case';

type OwnProps = {
  caseId: string;
  childName: string;
  officeName: string;
  counselor: string;
  onClickView: () => void;
};

const CaseDetailsHeader: React.FC<OwnProps> = ({ caseId, childName, officeName, counselor, onClickView }) => {
  return (
    <DetailsHeaderContainer>
      <DetailsHeaderChildName variant="h6">{childName}</DetailsHeaderChildName>
      <DetailsHeaderCaseContainer>
        <DetailsHeaderCaseId id="Case-CaseId-label">
          <Template code="Case-CaseNumber" />
          {caseId}
        </DetailsHeaderCaseId>
        {officeName && <DetailsHeaderOfficeName>{officeName}</DetailsHeaderOfficeName>}
      </DetailsHeaderCaseContainer>
      <DetailsHeaderCounselor>
        <Template code="Case-Counsellor" />: {counselor}
      </DetailsHeaderCounselor>
    </DetailsHeaderContainer>
  );
};

CaseDetailsHeader.displayName = 'CaseDetailsHeader';

export default CaseDetailsHeader;
