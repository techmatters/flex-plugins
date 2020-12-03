/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import CropFreeIcon from '@material-ui/icons/CropFree';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

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
  isOrphanedCase: boolean;
  onClickViewCase: () => void;
};

type Props = OwnProps;

const CaseHeader: React.FC<Props> = ({ caseId, childName, createdAt, updatedAt, isOrphanedCase, onClickViewCase }) => {
  const [mockedMessage, setMockedMessage] = useState(null);

  const createdAtFormatted = `${format(new Date(createdAt), 'MMM d, yyyy')}`;
  const updatedAtFormatted = `${format(new Date(updatedAt), 'MMM d, yyyy')}`;

  const { firstName, lastName } = childName || {};
  const isMockedMessageOpen = Boolean(mockedMessage);

  return (
    <>
      <CaseHeaderContainer>
        <CaseHeaderCaseId>#{caseId}</CaseHeaderCaseId>
        <CaseHeaderChildName>
          {isOrphanedCase ? (
            <Template code="CaseHeader-Voided" />
          ) : (
            <>
              {firstName ? firstName : <Template code="CaseHeader-NoData" />}
              &nbsp;
              {lastName ? lastName : <Template code="CaseHeader-NoData" />}
            </>
          )}
        </CaseHeaderChildName>
        <DateText>
          <Template code="CaseHeader-Opened" />: {createdAtFormatted}
        </DateText>
        <DateText>
          <Template code="CaseHeader-Updated" />: {updatedAtFormatted}
        </DateText>
        <StyledButtonBase onClick={onClickViewCase}>
          <HiddenText>
            <Template code="CaseHeader-ViewCase" />
          </HiddenText>
          <ViewCaseIcon style={{ fontSize: '20px' }} />
        </StyledButtonBase>
      </CaseHeaderContainer>
      <Dialog onClose={() => setMockedMessage(null)} open={isMockedMessageOpen}>
        <DialogContent>{mockedMessage}</DialogContent>
      </Dialog>
    </>
  );
};

CaseHeader.displayName = 'CaseHeader';

export default CaseHeader;
