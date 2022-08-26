import React from 'react';
import PropTypes from 'prop-types';

import ChildNameAndDate from './ChildNameAndDate';
import CallSummary from './CallSummary';
import TagsAndCounselor from './TagsAndCounselor';
import { contactType } from '../../../types';
import { ContactWrapper } from '../../../styles/search';
import { Flex } from '../../../styles/HrmStyles';

const ContactPreview = ({ contact, handleOpenConnectDialog, handleViewDetails, showConnectIcon }) => {
  const { counselor } = contact;
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
          counselor={counselor}
          categories={contact.overview.categories}
          definitionVersion={contact.details.definitionVersion}
        />
      </ContactWrapper>
    </Flex>
  );
};

ContactPreview.displayName = 'ContactPreview';

ContactPreview.propTypes = {
  contact: contactType.isRequired,
  handleOpenConnectDialog: PropTypes.func.isRequired,
  handleViewDetails: PropTypes.func.isRequired,
  showConnectIcon: PropTypes.bool.isRequired,
};

export default ContactPreview;
