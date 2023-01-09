import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import ContactHeader from './ContactHeader';
import TagsAndCounselor from '../TagsAndCounselor';
import { PreviewWrapper } from '../../../styles/search';
import { Flex } from '../../../styles/HrmStyles';
import { SearchUIContact } from '../../../types/types';
import { PreviewDescription } from '../PreviewDescription';
import { isNonDataCallType } from '../../../states/ValidationRules';
import { getDefinitionVersion } from '../../../services/ServerlessService';
import { updateDefinitionVersion } from '../../../states/configuration/actions';
import { configurationBase, namespace, RootState } from '../../../states';
import { contactLabelFromSearchContact } from '../../../states/contacts/contactIdentifier';

type ContactPreviewProps = {
  contact: SearchUIContact;
  handleViewDetails: () => void;
};

const mapStateToProps = (state: RootState) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
});

const connector = connect(mapStateToProps);

type Props = ContactPreviewProps & ConnectedProps<typeof connector>;

const ContactPreview: React.FC<Props> = ({ contact, handleViewDetails, definitionVersions }) => {
  const { counselorName, callerName } = contact;
  const { callType } = contact.overview;
  const { definitionVersion: versionId, caseInformation } = contact.details;
  const { callSummary } = caseInformation;
  const contactLabel = contactLabelFromSearchContact(definitionVersions[versionId], contact, {
    substituteForId: false,
    placeholder: '',
  });

  useEffect(() => {
    if (versionId && !definitionVersions[versionId]) {
      getDefinitionVersion(versionId).then(definitionVersion => updateDefinitionVersion(versionId, definitionVersion));
    }
  }, [versionId, definitionVersions]);

  return (
    <Flex>
      <PreviewWrapper key={contact.contactId}>
        <ContactHeader
          id={contact.contactId}
          channel={contact.overview.channel}
          callType={contact.overview.callType}
          name={contactLabel}
          callerName={callerName}
          number={contact.overview.customerNumber}
          date={contact.overview.dateTime}
          onClickFull={handleViewDetails}
        />
        {callSummary && (
          <PreviewDescription expandLinkText="CaseSummary-ReadMore" collapseLinkText="CaseSummary-ReadLess">
            {callSummary}
          </PreviewDescription>
        )}
        {isNonDataCallType(callType) ? (
          <TagsAndCounselor
            counselor={counselorName}
            nonDataCallType={callType}
            definitionVersion={contact.details.definitionVersion}
          />
        ) : (
          <TagsAndCounselor
            counselor={counselorName}
            categories={contact.overview.categories}
            definitionVersion={contact.details.definitionVersion}
          />
        )}
      </PreviewWrapper>
    </Flex>
  );
};

ContactPreview.displayName = 'ContactPreview';

export default connector(ContactPreview);
