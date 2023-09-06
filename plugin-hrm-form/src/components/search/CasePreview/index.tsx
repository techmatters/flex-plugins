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

/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Case } from '../../../types/types';
import CaseHeader from './CaseHeader';
import { Flex } from '../../../styles/HrmStyles';
import { PreviewWrapper } from '../../../styles/search';
import getUpdatedDate from '../../../states/getUpdatedDate';
import { PreviewDescription } from '../PreviewDescription';
import { getDefinitionVersion } from '../../../services/ServerlessService';
import { updateDefinitionVersion } from '../../../states/configuration/actions';
import { configurationBase, namespace, RootState } from '../../../states';
import TagsAndCounselor from '../TagsAndCounselor';
import { retrieveCategories } from '../../../states/contacts/contactDetailsAdapter';
import { contactLabelFromHrmContact } from '../../../states/contacts/contactIdentifier';

type OwnProps = {
  currentCase: Case;
  onClickViewCase: () => void;
  counselorsHash: { [sid: string]: string };
};

const mapStateToProps = (state: RootState) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
});

const connector = connect(mapStateToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const CasePreview: React.FC<Props> = ({ currentCase, onClickViewCase, counselorsHash, definitionVersions }) => {
  const { id, createdAt, connectedContacts, status, info, twilioWorkerId } = currentCase;
  const createdAtObj = new Date(createdAt);
  const updatedAtObj = getUpdatedDate(currentCase);
  const followUpDateObj = info.followUpDate ? new Date(info.followUpDate) : undefined;
  const { definitionVersion: versionId } = info;
  const orphanedCase = !connectedContacts || connectedContacts.length === 0;
  const firstContact = !orphanedCase && connectedContacts[0];
  const { categories } = (firstContact || {}).rawJson || {};
  const { callSummary } = ((firstContact || {}).rawJson || {}).caseInformation || {
    callSummary: undefined,
  };
  const summary = info?.summary || callSummary;
  const counselor = counselorsHash[twilioWorkerId];

  useEffect(() => {
    if (versionId && !definitionVersions[versionId]) {
      getDefinitionVersion(versionId).then(definitionVersion => updateDefinitionVersion(versionId, definitionVersion));
    }
  }, [versionId, definitionVersions]);

  const definitionVersion = definitionVersions[versionId];

  const statusLabel = definitionVersion?.caseStatus[status]?.label ?? status;
  const contactLabel = contactLabelFromHrmContact(definitionVersion, firstContact, {
    substituteForId: false,
    placeholder: '',
  });

  return (
    <Flex>
      <PreviewWrapper>
        <CaseHeader
          caseId={id}
          contactLabel={contactLabel}
          createdAt={createdAtObj}
          updatedAt={updatedAtObj}
          followUpDate={followUpDateObj}
          onClickViewCase={onClickViewCase}
          isOrphanedCase={orphanedCase}
          status={status}
          statusLabel={statusLabel}
        />
        {summary && (
          <PreviewDescription expandLinkText="ReadMore" collapseLinkText="ReadLess">
            {summary}
          </PreviewDescription>
        )}

        <TagsAndCounselor counselor={counselor} categories={categories} definitionVersion={definitionVersion} />
      </PreviewWrapper>
    </Flex>
  );
};

CasePreview.displayName = 'CasePreview';

const connected = connector(CasePreview);

export default connected;
