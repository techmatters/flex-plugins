/* eslint-disable react/prop-types */
/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import CropFreeIcon from '@material-ui/icons/CropFree';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { getConfig } from '../../../HrmFormPlugin';
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
  status: string;
  onClickViewCase: () => void;
};

type Props = OwnProps;

const CaseHeader: React.FC<Props> = ({
  caseId,
  childName,
  createdAt,
  updatedAt,
  isOrphanedCase,
  status,
  onClickViewCase,
}) => {
  const { strings } = getConfig();
  const [mockedMessage, setMockedMessage] = useState(null);

  const createdAtFormatted = `${format(new Date(createdAt), 'MMM d, yyyy')}`;
  const updatedAtFormatted = `${format(new Date(updatedAt), 'MMM d, yyyy')}`;

  const { firstName, lastName } = childName || {};
  const isMockedMessageOpen = Boolean(mockedMessage);

  return (
    <>
      <CaseHeaderContainer>
        <CaseHeaderCaseId closed={status === 'closed' || isOrphanedCase}>#{caseId}</CaseHeaderCaseId>
        <CaseHeaderChildName>
          {isOrphanedCase ? strings['CaseHeader-Voided'] : `${firstName} ${lastName}`}
        </CaseHeaderChildName>
        <DateText>
          <Template code="CaseHeader-Opened" />: {createdAtFormatted}
        </DateText>
        <DateText>
          <Template code={status === 'closed' || isOrphanedCase ? 'CaseHeader-Closed' : 'CaseHeader-Updated'} />:{' '}
          {updatedAtFormatted}
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
