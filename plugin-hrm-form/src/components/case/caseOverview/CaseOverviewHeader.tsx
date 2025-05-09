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
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { Print as PrintIcon } from '@material-ui/icons';
import { DefinitionVersion } from '@tech-matters/hrm-form-definitions';

import {
  DetailsHeaderCaseContainer,
  DetailsHeaderCaseId,
  DetailsHeaderOfficeName,
  DetailsHeaderCounselor,
  DetailsHeaderContainer,
  StyledPrintButton,
} from '../styles';
import { Flex, Box } from '../../../styles';
import { getHrmConfig } from '../../../hrmConfig';
import CaseTags from '../CaseTags';

type OwnProps = {
  caseId: string;
  office?: string;
  counselor: string;
  handlePrintCase: () => void;
  isOrphanedCase: boolean;
  definitionVersion: DefinitionVersion;
  categories: { [category: string]: string[] };
};

const CaseOverviewHeader: React.FC<OwnProps> = ({
  caseId,
  office,
  counselor,
  handlePrintCase,
  isOrphanedCase,
  definitionVersion,
  categories,
}) => {
  const { multipleOfficeSupport } = getHrmConfig();

  return (
    <DetailsHeaderContainer>
      <Flex justifyContent="space-between">
        <Box style={{ flexGrow: 1 }}>
          <DetailsHeaderCaseContainer>
            <DetailsHeaderCaseId id="Case-CaseId-label" data-testid="Case-DetailsHeaderCaseId">
              <Template code="Case-CaseNumber" />
              {caseId}
            </DetailsHeaderCaseId>
            {multipleOfficeSupport && office && <DetailsHeaderOfficeName> ({office})</DetailsHeaderOfficeName>}
          </DetailsHeaderCaseContainer>
          <DetailsHeaderCounselor data-testid="Case-DetailsHeaderCounselor">
            <Template code="Case-Counsellor" />: {counselor}
          </DetailsHeaderCounselor>
        </Box>
        {!isOrphanedCase && (
          <StyledPrintButton
            onClick={handlePrintCase}
            aria-label="Print"
            data-testid="CasePrint-Button"
            icon={<PrintIcon />}
          />
        )}
      </Flex>
      <CaseTags definitionVersion={definitionVersion} categories={categories} />
    </DetailsHeaderContainer>
  );
};

CaseOverviewHeader.displayName = 'CaseOverviewHeader';

export default CaseOverviewHeader;
