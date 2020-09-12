import React from 'react';
import PropTypes from 'prop-types';

import { ContactWrapper } from '../../../styles/search';
import ChildNameAndDate from './ChildNameAndDate';
import CallSummary from './CallSummary';
import TagsAndCounselor from './TagsAndCounselor';
import { contactType } from '../../../types';

const ContactPreview = ({ contact, handleOpenConnectDialog, handleViewDetails, handleMockedMessage }) => {
  const { counselor } = contact;

  const { callSummary } = contact.details.caseInformation;

  return (
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
      <TagsAndCounselor counselor={counselor} categories={contact.overview.categories} />
    </ContactWrapper>
  );
};

ContactPreview.displayName = 'ContactPreview';

ContactPreview.propTypes = {
  contact: contactType.isRequired,
  handleOpenConnectDialog: PropTypes.func.isRequired,
  handleViewDetails: PropTypes.func.isRequired,
  handleMockedMessage: PropTypes.func.isRequired,
};

export default ContactPreview;
