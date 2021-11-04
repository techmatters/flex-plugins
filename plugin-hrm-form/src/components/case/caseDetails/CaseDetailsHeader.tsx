/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { Print as PrintIcon } from '@material-ui/icons';

import { getConfig } from '../../../HrmFormPlugin';
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
import { Flex, Box, FormCheckbox, FormLabel } from '../../../styles/HrmStyles';
import { PermissionActions, PermissionActionType } from '../../../permissions';

type OwnProps = {
  caseId: string;
  childName: string;
  office: string;
  counselor: string;
  childIsAtRisk: boolean;
  handlePrintCase: () => void;
  handleClickChildIsAtRisk: () => void;
  isOrphanedCase: boolean;
  can: (action: PermissionActionType) => boolean;
};

const CaseDetailsHeader: React.FC<OwnProps> = ({
  caseId,
  childName,
  office,
  counselor,
  childIsAtRisk,
  handlePrintCase,
  handleClickChildIsAtRisk,
  isOrphanedCase,
  can,
}) => {
  const { multipleOfficeSupport } = getConfig();
  return (
    <DetailsHeaderContainer>
      <DetailsHeaderTextContainer>
        <DetailsHeaderChildName variant="h6">{childName}</DetailsHeaderChildName>
        <DetailsHeaderCaseContainer>
          <DetailsHeaderCaseId id="Case-CaseId-label">
            <Template code="Case-CaseNumber" />
            {caseId}
          </DetailsHeaderCaseId>
          {multipleOfficeSupport && office && <DetailsHeaderOfficeName>({office})</DetailsHeaderOfficeName>}
        </DetailsHeaderCaseContainer>
        <DetailsHeaderCounselor>
          <Template code="Case-Counsellor" />: {counselor}
        </DetailsHeaderCounselor>
      </DetailsHeaderTextContainer>
      <Flex flexDirection="column" height="75px">
        <Box alignSelf="flex-end">
          {!isOrphanedCase && <StyledPrintButton onClick={handlePrintCase} aria-label="Print" icon={<PrintIcon />} />}
        </Box>
        <DetailsHeaderChildAtRiskContainer style={{ marginTop: 'auto', marginRight: 'auto' }}>
          <FormLabel htmlFor="childIsAtRisk">
            <ChildIsAtRiskWrapper style={{ height: 'auto' }}>
              <Box marginRight="5px">
                <FormCheckbox
                  id="childIsAtRisk"
                  data-testid="Case-ChildIsAtRisk-Checkbox"
                  name="childIsAtRisk"
                  type="checkbox"
                  onChange={handleClickChildIsAtRisk}
                  defaultChecked={Boolean(childIsAtRisk)}
                  disabled={!can(PermissionActions.EDIT_CHILD_IS_AT_RISK)}
                />
              </Box>
              <Template code="Case-ChildIsAtRisk" />
            </ChildIsAtRiskWrapper>
          </FormLabel>
        </DetailsHeaderChildAtRiskContainer>
      </Flex>
    </DetailsHeaderContainer>
  );
};

CaseDetailsHeader.displayName = 'CaseDetailsHeader';

export default CaseDetailsHeader;
