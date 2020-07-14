import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

import { ContactWrapper } from '../../../styles/search';
import ChildNameAndActions from './ChildNameAndActions';
import CallTypeAndCounselor from './CallTypeAndCounselor';
import CallSummary from './CallSummary';
import DateAndTags from './DateAndTags';
import { contactType } from '../../../types';
import { formatName, mapCallType } from '../../../utils';
import { isNonDataCallType } from '../../../states/ValidationRules';

const ContactPreview = ({ contact, handleOpenConnectDialog, handleViewDetails, handleMockedMessage }) => {
  const name = formatName(contact.overview.name).toUpperCase();

  const dateString = `${format(new Date(contact.overview.dateTime), 'MMM d, yyyy h:mm aaaaa')}m`;
  const callType = mapCallType(contact.overview.callType);
  const isNonDataContact = isNonDataCallType(contact.overview.callType);
  const { counselor } = contact;

  const { callSummary } = contact.details.caseInformation;

  const [category1, category2, category3] = contact.overview.categories;

  return (
    <ContactWrapper key={contact.contactId}>
      <ChildNameAndActions
        name={name}
        isNonDataContact={isNonDataContact}
        onClickChain={handleOpenConnectDialog}
        onClickFull={handleViewDetails}
        onClickMore={handleMockedMessage}
      />
      <CallTypeAndCounselor callType={callType} counselor={counselor} />
      <CallSummary callSummary={callSummary} onClickFull={handleViewDetails} />
      <DateAndTags dateString={dateString} category1={category1} category2={category2} category3={category3} />
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
