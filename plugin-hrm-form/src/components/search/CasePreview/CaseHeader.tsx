/* eslint-disable react/prop-types */
import React from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';

import { getConfig } from '../../../HrmFormPlugin';
import { SubtitleLabel, SubtitleValue, StyledLink, PreviewHeaderText, PreviewRow } from '../../../styles/search';
import { Flex } from '../../../styles/HrmStyles';

type OwnProps = {
  caseId: number;
  childName?: {
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt?: Date;
  followUpDate?: Date;
  isOrphanedCase: boolean;
  status: string;
  statusLabel: string;
  onClickViewCase: () => void;
};

type Props = OwnProps;

const CaseHeader: React.FC<Props> = ({
  caseId,
  childName,
  createdAt,
  updatedAt,
  followUpDate,
  isOrphanedCase,
  status,
  statusLabel,
  onClickViewCase,
}) => {
  const { strings } = getConfig();

  const { firstName, lastName } = childName || {};

  return (
    <div>
      <PreviewRow>
        <Flex justifyContent="space-between" width="100%" marginTop="10px">
          <Flex style={{ minWidth: 'fit-content' }}>
            <StyledLink underline={true} style={{ minWidth: 'inherit', marginInlineEnd: 10 }} onClick={onClickViewCase}>
              <PreviewHeaderText style={{ textDecoration: 'underline' }}>#{caseId}</PreviewHeaderText>
            </StyledLink>
            <PreviewHeaderText>
              {isOrphanedCase ? strings['CaseHeader-Voided'] : `${firstName} ${lastName}`}
            </PreviewHeaderText>
          </Flex>
          <Flex style={{ minWidth: 'fit-content' }}>
            <PreviewHeaderText style={{ fontWeight: 400 }}>{statusLabel}</PreviewHeaderText>
          </Flex>
        </Flex>
      </PreviewRow>
      <PreviewRow>
        <SubtitleLabel>
          <Template code="CaseHeader-Opened" />:
        </SubtitleLabel>
        <SubtitleValue>{format(createdAt, 'MMM d, yyyy')}</SubtitleValue>
        {updatedAt && (
          <>
            <SubtitleLabel>
              <Template code={status === 'closed' || isOrphanedCase ? 'CaseHeader-Closed' : 'CaseHeader-Updated'} />:
            </SubtitleLabel>
            <SubtitleValue>{format(updatedAt, 'MMM d, yyyy')}</SubtitleValue>
          </>
        )}
        {followUpDate && (
          <>
            <SubtitleLabel>
              <Template code="CaseHeader-FollowUpDate" />:
            </SubtitleLabel>
            <SubtitleValue>{format(followUpDate, 'MMM d, yyyy')}</SubtitleValue>
          </>
        )}
      </PreviewRow>
    </div>
  );
};

CaseHeader.displayName = 'CaseHeader';

export default CaseHeader;
