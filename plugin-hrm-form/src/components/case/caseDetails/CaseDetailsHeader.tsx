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
} from '../../../styles/case';

type OwnProps = {
  caseId: string;
  childName: string;
  officeName: string;
  onClickView: () => void;
};

const CaseDetailsHeader: React.FC<OwnProps> = ({ caseId, childName, officeName, onClickView }) => {
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
    </DetailsHeaderContainer>
  );
};

CaseDetailsHeader.displayName = 'CaseDetailsHeader';

export default CaseDetailsHeader;
