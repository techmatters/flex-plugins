import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Card, CardContent } from '@material-ui/core';

import { ContactWrapper } from '../../../Styles/search';
import ChildNameAndActions from './ChildNameAndActions';
import CallTypeAndCounselor from './CallTypeAndCounselor';
import CallSummary from './CallSummary';
import DateAndTags from './DateAndTags';
import { contactType } from '../../../types';

/**
 * @param {string} str
 * @return {string}
 */
export const mapCallType = str => {
  switch (str) {
    case 'Child calling about self':
      return 'SELF';
    case 'Someone calling about a child':
      return 'CALLER';
    default:
      return str.toUpperCase();
  }
};

const ContactPreview = ({ contact, onClick, handleConnect, handleViewDetails }) => {
  const name = (contact.overview.name.trim() === '' ? 'Unknown' : contact.overview.name).toUpperCase();

  const dateString = `${format(new Date(contact.overview.dateTime), 'MMM d, yyyy h:mm aaaaa')}m`;
  const callType = mapCallType(contact.overview.callType);
  const { counselor } = contact;

  const { callSummary } = contact.details.caseInformation;

  const [tag1, tag2, tag3] = contact.tags;

  const mockedAction = () => onClick('Not implemented yet');

  return (
    <ContactWrapper key={contact.contactId}>
      <Card>
        <CardContent>
          <ChildNameAndActions
            name={name}
            onClickChain={handleConnect}
            onClickFull={handleViewDetails}
            onClickMore={mockedAction}
          />
          <CallTypeAndCounselor callType={callType} counselor={counselor} />
          <CallSummary callSummary={callSummary} onClickFull={handleViewDetails} />
          <DateAndTags dateString={dateString} tag1={tag1} tag2={tag2} tag3={tag3} />
        </CardContent>
      </Card>
    </ContactWrapper>
  );
};

ContactPreview.displayName = 'ContactPreview';

ContactPreview.propTypes = {
  contact: contactType.isRequired,
  onClick: PropTypes.func.isRequired,
  handleConnect: PropTypes.func.isRequired,
  handleViewDetails: PropTypes.func.isRequired,
};

export default ContactPreview;
