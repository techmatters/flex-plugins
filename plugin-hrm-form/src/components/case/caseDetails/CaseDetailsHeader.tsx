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
/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { Print as PrintIcon } from '@material-ui/icons';

import {
  DetailsHeaderCaseContainer,
  DetailsHeaderCaseId,
  DetailsHeaderOfficeName,
  DetailsHeaderCounselor,
  DetailsHeaderContainer,
  DetailsHeaderTextContainer,
  StyledPrintButton,
} from '../../../styles/case';
import { Flex, Box } from '../../../styles/HrmStyles';
import { getHrmConfig } from '../../../hrmConfig';

type OwnProps = {
  caseId: string;
  office: string;
  counselor: string;
  handlePrintCase: () => void;
  isOrphanedCase: boolean;
};

const CaseDetailsHeader: React.FC<OwnProps> = ({ caseId, office, counselor, handlePrintCase, isOrphanedCase }) => {
  const { multipleOfficeSupport } = getHrmConfig();

  return (
    <DetailsHeaderContainer>
      <DetailsHeaderTextContainer>
        <DetailsHeaderCaseContainer>
          <DetailsHeaderCaseId id="Case-CaseId-label" data-testid="Case-DetailsHeaderCaseId">
            <Template code="Case-CaseNumber" />
            {caseId}
          </DetailsHeaderCaseId>
          {multipleOfficeSupport && office && <DetailsHeaderOfficeName>({office})</DetailsHeaderOfficeName>}
        </DetailsHeaderCaseContainer>
        <DetailsHeaderCounselor data-testid="Case-DetailsHeaderCounselor">
          <Template code="Case-Counsellor" />: {counselor}
        </DetailsHeaderCounselor>
      </DetailsHeaderTextContainer>
      <Flex flexDirection="column" height="75px">
        <Box alignSelf="flex-end">
          {!isOrphanedCase && (
            <StyledPrintButton
              onClick={handlePrintCase}
              aria-label="Print"
              data-testid="CasePrint-Button"
              icon={<PrintIcon />}
            />
          )}
        </Box>
      </Flex>
    </DetailsHeaderContainer>
  );
};

CaseDetailsHeader.displayName = 'CaseDetailsHeader';

export default CaseDetailsHeader;
