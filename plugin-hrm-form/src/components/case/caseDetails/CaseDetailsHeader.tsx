/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { Typography } from '@material-ui/core';

import { DetailsHeaderContainer } from '../../../styles/case';

type OwnProps = {
  caseId: string; // ToDo: change this
  childName: string;
  onClickView: () => void;
};

const CaseDetailsHeader: React.FC<OwnProps> = ({ caseId, childName, onClickView }) => {
  return (
    <DetailsHeaderContainer>
      <Typography variant="h6">{childName}</Typography>
      <Typography>
        <Template code="Case-CaseNumber" />
        {caseId}
      </Typography>
    </DetailsHeaderContainer>
  );
};

CaseDetailsHeader.displayName = 'CaseDetailsHeader';

export default CaseDetailsHeader;
