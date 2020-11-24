/* eslint-disable react/prop-types */
import React from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import CropFreeIcon from '@material-ui/icons/CropFree';

import {
  CaseHeaderContainer,
  CaseHeaderCaseId,
  CaseHeaderChildName,
  DateText,
  StyledButtonBase,
} from '../../../styles/search';
import { StyledIcon, addHover, HiddenText } from '../../../styles/HrmStyles';

const ViewCaseIcon = addHover(StyledIcon(CropFreeIcon));

type OwnProps = {
  caseId: number;
  childName?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
};

type Props = OwnProps;

const CaseHeader: React.FC<Props> = ({ caseId, childName, createdAt, updatedAt }) => {
  const createdAtFormatted = `${format(new Date(createdAt), 'MMM d, yyyy')}`;
  const updatedAtFormatted = `${format(new Date(updatedAt), 'MMM d, yyyy')}`;

  const { firstName, lastName } = childName || {};
  return (
    <CaseHeaderContainer>
      <CaseHeaderCaseId>#{caseId}</CaseHeaderCaseId>
      <CaseHeaderChildName>{childName ? `${firstName} ${lastName}` : 'No Data'}</CaseHeaderChildName>
      <DateText>
        <Template code="CaseHeader-Opened" />: {createdAtFormatted}
      </DateText>
      <DateText>
        <Template code="CaseHeader-Updated" />: {updatedAtFormatted}
      </DateText>
      <StyledButtonBase onClick={() => null}>
        <HiddenText>
          <Template code="CaseHeader-ViewCase" />
        </HiddenText>
        <ViewCaseIcon style={{ fontSize: '20px' }} />
      </StyledButtonBase>
    </CaseHeaderContainer>
  );
};

CaseHeader.displayName = 'CaseHeader';

export default CaseHeader;
