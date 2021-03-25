/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import { Case } from '../../../types/types';
import CaseHeader from './CaseHeader';
import CaseSummary from './CaseSummary';
import CaseTags from '../../case/CaseTags';
import { Flex } from '../../../styles/HrmStyles';
import { CaseWrapper, CaseFooter, CaseFooterText, CounselorText, SummaryText } from '../../../styles/search';

type OwnProps = {
  currentCase: Case;
  onClickViewCase: () => void;
  counselorsHash: { [sid: string]: string };
};

type Props = OwnProps;

const CasePreview: React.FC<Props> = ({ currentCase, onClickViewCase, counselorsHash }) => {
  const { id, createdAt, updatedAt, connectedContacts, status, info } = currentCase;

  const orphanedCase = !connectedContacts || connectedContacts.length === 0;
  const firstContact = !orphanedCase && connectedContacts[0];
  const { name } = ((firstContact || {}).rawJson || {}).childInformation || {};
  const { categories, callSummary } = ((firstContact || {}).rawJson || {}).caseInformation || {};
  const summary = info?.summary || callSummary;
  const counselor = counselorsHash[firstContact?.twilioWorkerId];

  return (
    <Flex>
      <CaseWrapper>
        <CaseHeader
          caseId={id}
          childName={name}
          createdAt={createdAt}
          updatedAt={updatedAt}
          onClickViewCase={onClickViewCase}
          isOrphanedCase={orphanedCase}
          status={status}
        />
        <CaseSummary summary={summary} />
        <CaseFooter>
          <CaseTags definitionVersion={info.definitionVersion} categories={categories} />
          <CaseFooterText>
            <CounselorText style={{ marginRight: 5 }}>
              <Template code="CallTypeAndCounselor-Label" />
            </CounselorText>
            {counselor && <SummaryText>{counselor}</SummaryText>}
          </CaseFooterText>
        </CaseFooter>
      </CaseWrapper>
    </Flex>
  );
};

CasePreview.displayName = 'CasePreview';

export default CasePreview;
