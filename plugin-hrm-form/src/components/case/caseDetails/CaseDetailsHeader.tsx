/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import {
  DetailsHeaderChildName,
  DetailsHeaderCaseContainer,
  DetailsHeaderCaseId,
  DetailsHeaderOfficeName,
  DetailsHeaderCounselor,
} from '../../../styles/case';
import { Flex, FormCheckbox, FormLabel, FormCheckBoxWrapper } from '../../../styles/HrmStyles';

type OwnProps = {
  caseId: string;
  childName: string;
  officeName: string;
  counselor: string;
  childIsAtRisk: boolean;
  handleClickChildIsAtRisk: () => void;
};

const CaseDetailsHeader: React.FC<OwnProps> = ({
  caseId,
  childName,
  officeName,
  counselor,
  childIsAtRisk,
  handleClickChildIsAtRisk,
}) => {
  return (
    <Flex>
      <Flex flexDirection="column">
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
      </Flex>
      <FormLabel htmlFor="childIsAtRisk" style={{ marginLeft: 'auto', marginTop: 'auto', textTransform: 'uppercase' }}>
        <FormCheckBoxWrapper style={{ height: 'auto' }}>
          <FormCheckbox
            id="childIsAtRisk"
            name="childIsAtRisk"
            type="checkbox"
            onChange={handleClickChildIsAtRisk}
            defaultChecked={Boolean(childIsAtRisk)}
          />
          <Template code="Case-ChildIsAtRisk" />
        </FormCheckBoxWrapper>
      </FormLabel>
    </Flex>
  );
};

CaseDetailsHeader.displayName = 'CaseDetailsHeader';

export default CaseDetailsHeader;
