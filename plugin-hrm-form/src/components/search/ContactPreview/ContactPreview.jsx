import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

import { ContactWrapper } from '../../../styles/search';
import ChildNameAndDate from './ChildNameAndDate';
import CallTypeAndCounselor from './CallTypeAndCounselor';
import CallSummary from './CallSummary';
import DateAndTags from './DateAndTags';
import { contactType } from '../../../types';
import { formatCategories, mapCallType } from '../../../utils';

const ContactPreview = ({ contact, handleOpenConnectDialog, handleViewDetails, handleMockedMessage }) => {
  const dateString = `${format(new Date(contact.overview.dateTime), 'MMM d, yyyy h:mm aaaaa')}m`;
  const callType = mapCallType(contact.overview.callType);
  const { counselor } = contact;

  const { callSummary } = contact.details.caseInformation;

  const [category1, category2, category3] = formatCategories(contact.overview.categories);

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
      <CallTypeAndCounselor callType={callType} counselor={counselor} />
      <CallSummary callSummary={callSummary} onClickFull={handleViewDetails} />
      <DateAndTags
        dateString={dateString}
        categories={contact.overview.categories}
        category1={category1}
        category2={category2}
        category3={category3}
      />
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
