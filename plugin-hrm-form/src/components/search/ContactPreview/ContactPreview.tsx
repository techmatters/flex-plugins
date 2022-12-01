import React from 'react';

import ChildNameAndDate from './ChildNameAndDate';
import CallSummary from './CallSummary';
import TagsAndCounselor from './TagsAndCounselor';
import { ContactWrapper, SummaryText } from '../../../styles/search';
import { Flex } from '../../../styles/HrmStyles';
import { SearchUIContact } from '../../../types/types';
import ExpandableTextBlock from '../ExpandableTextBlock';

type ContactPreviewProps = {
  contact: SearchUIContact;
  handleViewDetails: () => void;
};

const ContactPreview: React.FC<ContactPreviewProps> = ({ contact, handleViewDetails }) => {
  const { counselorName } = contact;
  const { callSummary } = contact.details.caseInformation;

  return (
    <Flex>
      <ContactWrapper key={contact.contactId}>
        <ChildNameAndDate
          id={contact.contactId}
          channel={contact.overview.channel}
          callType={contact.overview.callType}
          name={contact.overview.name}
          number={contact.overview.customerNumber}
          date={contact.overview.dateTime}
          onClickFull={handleViewDetails}
        />
        <ExpandableTextBlock expandLinkText={'show more'} collapseLinkText={'show less'}>
          <SummaryText style={{whiteSpace: 'inherit'}}>{callSummary}</SummaryText>
        </ExpandableTextBlock>
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
