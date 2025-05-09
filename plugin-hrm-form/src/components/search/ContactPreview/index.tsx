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

import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { callTypes } from '@tech-matters/hrm-form-definitions';

import ContactHeader from './ContactHeader';
import TagsAndCounselor from '../TagsAndCounselor';
import { Flex, PreviewWrapper } from '../../../styles';
import { Contact, ContactRawJson } from '../../../types/types';
import { PreviewDescription } from '../PreviewDescription';
import { isNonDataCallType } from '../../../states/validationRules';
import { getDefinitionVersion } from '../../../services/ServerlessService';
import { updateDefinitionVersion } from '../../../states/configuration/actions';
import { RootState } from '../../../states';
import { contactLabelFromHrmContact } from '../../../states/contacts/contactIdentifier';
import { PreviewRow } from '../styles';
import { selectDefinitionVersions } from '../../../states/configuration/selectDefinitions';
import { selectCounselorName } from '../../../states/configuration/selectCounselorsHash';

type ContactPreviewProps = {
  contact: Contact;
  handleViewDetails: () => void;
};

const mapStateToProps = (state: RootState, { contact }: ContactPreviewProps) => ({
  definitionVersions: selectDefinitionVersions(state),
  counselorName: selectCounselorName(state, contact.twilioWorkerId),
});

const connector = connect(mapStateToProps);

type Props = ContactPreviewProps & ConnectedProps<typeof connector>;

/**
 * Since different helplines can have different forms, this function is a
 * best-effort for finding out the name.
 *
 * Return undefined if calling about self
 */
const getCallerName = (rawJson: ContactRawJson) => {
  const { callType } = rawJson;

  if (callType === callTypes.child) {
    return undefined;
  }

  const { firstName, lastName, name, nickname } = rawJson.callerInformation;

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName as string;
  }

  if (name) {
    return name as string;
  }

  if (nickname) {
    return nickname as string;
  }

  return undefined;
};

const ContactPreview: React.FC<Props> = ({ contact, handleViewDetails, definitionVersions, counselorName }) => {
  const { callType } = contact.rawJson;
  const callerName = getCallerName(contact.rawJson);
  const { definitionVersion: versionId, caseInformation } = contact.rawJson;
  const { callSummary } = caseInformation;
  const definition = definitionVersions[versionId];
  const contactLabel = contactLabelFromHrmContact(definition, contact, {
    substituteForId: false,
    placeholder: '',
  });

  useEffect(() => {
    if (versionId && !definitionVersions[versionId]) {
      getDefinitionVersion(versionId).then(definitionVersion => updateDefinitionVersion(versionId, definitionVersion));
    }
  }, [versionId, definitionVersions]);

  return (
    <Flex width="100%">
      <PreviewWrapper key={contact.id}>
        <ContactHeader
          id={contact.id}
          channel={contact.channel}
          callType={callType}
          name={contactLabel}
          callerName={callerName}
          number={contact.number}
          date={contact.timeOfContact}
          onClickFull={handleViewDetails}
          isDraft={!contact.finalizedAt}
        />
        {callSummary && (
          <PreviewRow>
            <PreviewDescription expandLinkText="ReadMore" collapseLinkText="ReadLess">
              {callSummary}
            </PreviewDescription>
          </PreviewRow>
        )}
        {isNonDataCallType(callType) ? (
          <TagsAndCounselor counselor={counselorName} nonDataCallType={callType} definitionVersion={definition} />
        ) : (
          <TagsAndCounselor
            counselor={counselorName}
            categories={contact.rawJson.categories}
            definitionVersion={definition}
          />
        )}
      </PreviewWrapper>
    </Flex>
  );
};

ContactPreview.displayName = 'ContactPreview';

export default connector(ContactPreview);
