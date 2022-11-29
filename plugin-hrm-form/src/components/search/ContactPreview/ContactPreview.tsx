import React from 'react';
import PropTypes from 'prop-types';

import ChildNameAndDate from './ChildNameAndDate';
import CallSummary from './CallSummary';
import TagsAndCounselor from './TagsAndCounselor';
import { ContactWrapper } from '../../../styles/search';
import { Flex } from '../../../styles/HrmStyles';
import { SearchUIContact } from '../../../types/types';

type ContactPreviewProps = {
  contact: SearchUIContact,
  handleViewDetails: () => void
}

const ContactPreview: React.FC<ContactPreviewProps> = ({ contact, handleViewDetails }) => {
  const { counselorName } = contact;
  const { callSummary } = contact.details.caseInformation;

  return (
    <Flex>
      <ContactWrapper key={contact.contactId}>
        <ChildNameAndDate
          channel={contact.overview.channel}
          callType={contact.overview.callType}
          name={contact.overview.name}
          number={contact.overview.customerNumber}
          date={contact.overview.dateTime}
          onClickFull={handleViewDetails}
        />
        <CallSummary callSummary={callSummary} onClickFull={handleViewDetails} />
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
