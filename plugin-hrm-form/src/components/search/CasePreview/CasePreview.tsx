/* eslint-disable react/prop-types */
import React from 'react';

import { Case } from '../../../types/types';
import CaseHeader from './CaseHeader';
import CaseSummary from './CaseSummary';
import CaseTags from './CaseTags';
import { Flex } from '../../../styles/HrmStyles';
import { CaseWrapper } from '../../../styles/search';

type OwnProps = {
  currentCase: Case;
  onClickViewCase: () => void;
};

type Props = OwnProps;

const CasePreview: React.FC<Props> = ({ currentCase, onClickViewCase }) => {
  const { id, createdAt, updatedAt, connectedContacts, status, info } = currentCase;

  const orphanedCase = !connectedContacts || connectedContacts.length === 0;
  const firstContact = !orphanedCase && connectedContacts[0];
  const { name } = ((firstContact || {}).rawJson || {}).childInformation || {};
  const { categories, callSummary } = ((firstContact || {}).rawJson || {}).caseInformation || {};
  const summary = info?.summary || callSummary;

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
        <CaseTags categories={categories} />
      </CaseWrapper>
    </Flex>
  );
};

CasePreview.displayName = 'CasePreview';

export default CasePreview;
