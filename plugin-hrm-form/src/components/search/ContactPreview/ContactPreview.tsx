import React from 'react';

import ChildNameAndDate from './ChildNameAndDate';
import TagsAndCounselor from './TagsAndCounselor';
import { ContactWrapper } from '../../../styles/search';
import { Flex } from '../../../styles/HrmStyles';
import { SearchUIContact } from '../../../types/types';
import { PreviewDescription } from '../PreviewDescription';

type ContactPreviewProps = {
  contact: SearchUIContact;
  handleViewDetails: () => void;
};

const ContactPreview: React.FC<ContactPreviewProps> = ({ contact, handleViewDetails }) => {
  const { counselorName, callerName } = contact;
  const { callSummary } = contact.details.caseInformation;

  return (
    <Flex>
      <ContactWrapper key={contact.contactId}>
        <ChildNameAndDate
          id={contact.contactId}
          channel={contact.overview.channel}
          callType={contact.overview.callType}
          name={contact.overview.name}
          callerName={callerName}
          number={contact.overview.customerNumber}
          date={contact.overview.dateTime}
          onClickFull={handleViewDetails}
        />
        <PreviewDescription expandLinkText="show more" collapseLinkText="show less">
          {callSummary}
        </PreviewDescription>
        <TagsAndCounselor
          counselor={counselorName}
          categories={contact.overview.categories}
          definitionVersion={contact.details.definitionVersion}
        />
      </ContactWrapper>
    </Flex>
  );
};

ContactPreview.displayName = 'ContactPreview';

export default ContactPreview;
