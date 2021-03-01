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
} from '../../../styles/case';
import { Flex, Box, FormCheckbox, FormLabel, FormCheckBoxWrapper } from '../../../styles/HrmStyles';
import { CaseStatus } from '../../../types/types';

type OwnProps = {
  caseId: string;
  childName: string;
  officeName: string;
  counselor: string;
  childIsAtRisk: boolean;
  status: CaseStatus;
  handlePrintCase: () => void;
  handleClickChildIsAtRisk: () => void;
};

const CaseDetailsHeader: React.FC<OwnProps> = ({
  caseId,
  childName,
  officeName,
  counselor,
  childIsAtRisk,
  status,
  handlePrintCase,
  handleClickChildIsAtRisk,
}) => {
  return (
    <Flex>
      <Flex flexDirection="column">
        <Flex flexDirection="row">
          <DetailsHeaderChildName variant="h6">{childName}</DetailsHeaderChildName>
          <Button onClick={handlePrintCase} aria-label="Print">
            <PrintIcon />
          </Button>
        </Flex>
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
      </Flex>
      <FormLabel htmlFor="childIsAtRisk" style={{ marginLeft: 'auto', marginTop: 'auto', textTransform: 'uppercase' }}>
        <FormCheckBoxWrapper style={{ height: 'auto' }}>
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
        </FormCheckBoxWrapper>
      </FormLabel>
    </Flex>
  );
};

CaseDetailsHeader.displayName = 'CaseDetailsHeader';

export default CaseDetailsHeader;
