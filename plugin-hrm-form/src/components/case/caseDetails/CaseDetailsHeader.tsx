/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { Button } from '@material-ui/core';
import { Print as PrintIcon } from '@material-ui/icons';

import {
  DetailsHeaderChildName,
  DetailsHeaderCaseContainer,
  DetailsHeaderCaseId,
  DetailsHeaderOfficeName,
  DetailsHeaderCounselor,
  DetailsHeaderContainer,
  DetailsHeaderTextContainer,
  DetailsHeaderChildAtRiskContainer,
  ChildIsAtRiskWrapper,
  StyledPrintButton,
} from '../../../styles/case';
import { Box, FormCheckbox, FormLabel } from '../../../styles/HrmStyles';
import { CaseStatus } from '../../../types/types';

type OwnProps = {
  caseId: string;
  childName: string;
  office: string;
  counselor: string;
  childIsAtRisk: boolean;
  status: CaseStatus;
  handlePrintCase: () => void;
  handleClickChildIsAtRisk: () => void;
  isOrphanedCase: boolean;
};

const CaseDetailsHeader: React.FC<OwnProps> = ({
  caseId,
  childName,
  office,
  counselor,
  childIsAtRisk,
  status,
  handlePrintCase,
  handleClickChildIsAtRisk,
  isOrphanedCase,
}) => {
  return (
    <DetailsHeaderContainer>
      <DetailsHeaderTextContainer>
        <DetailsHeaderChildName variant="h6">{childName}</DetailsHeaderChildName>
        <DetailsHeaderCaseContainer>
          <DetailsHeaderCaseId id="Case-CaseId-label">
            <Template code="Case-CaseNumber" />
            {caseId}
          </DetailsHeaderCaseId>
          {office && <DetailsHeaderOfficeName>({office})</DetailsHeaderOfficeName>}
        </DetailsHeaderCaseContainer>
        <DetailsHeaderCounselor>
          <Template code="Case-Counsellor" />: {counselor}
        </DetailsHeaderCounselor>
      </DetailsHeaderTextContainer>
      <DetailsHeaderChildAtRiskContainer>
        <FormLabel
          htmlFor="childIsAtRisk"
          style={{ marginLeft: 'auto', marginTop: 'auto', textTransform: 'uppercase' }}
        >
          <ChildIsAtRiskWrapper style={{ height: 'auto' }}>
            <Box marginRight="5px">
              <FormCheckbox
                id="childIsAtRisk"
                data-testid="Case-ChildIsAtRisk-Checkbox"
                name="childIsAtRisk"
                type="checkbox"
                onChange={handleClickChildIsAtRisk}
                defaultChecked={Boolean(childIsAtRisk)}
                disabled={status === 'closed'}
              />
            </Box>
            <Template code="Case-ChildIsAtRisk" />
          </ChildIsAtRiskWrapper>
        </FormLabel>
      </DetailsHeaderChildAtRiskContainer>
      {!isOrphanedCase && (
        <div>
          <StyledPrintButton onClick={handlePrintCase} aria-label="Print" icon={<PrintIcon />} />
        </div>
      )}
    </DetailsHeaderContainer>
  );
};

CaseDetailsHeader.displayName = 'CaseDetailsHeader';

export default CaseDetailsHeader;
