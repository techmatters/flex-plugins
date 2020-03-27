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

const mapper = string => {
  if (string === 'SOMEONE') return 'CALLER';
  if (string === 'CHILD') return 'SELF';
  return string;
};

/**
 * Returns first word of the string as uppercase
 * and maps as specified:
 * CHILD -> SELF
 * SOMEONE -> CALLER
 * anything else is unchanged
 * @param {string} str
 * @return {string}
 */
export const mapAndToUpper = str => {
  const fst = str.split(' ')[0].toUpperCase();
  const mapped = mapper(fst);
  return mapped;
};

const ContactPreview = ({ contact, onClick, handleConnect }) => {
  const name = (contact.overview.name.trim() === '' ? 'Unknown' : contact.overview.name).toUpperCase();

  const dateString = `${format(new Date(contact.overview.dateTime), 'MMM d, yyyy h:mm aaaaa')}m`;
  const callType = mapAndToUpper(contact.overview.callType);
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
            onClickFull={mockedAction}
            onClickMore={mockedAction}
          />
          <CallTypeAndCounselor callType={callType} counselor={counselor} />
          <CallSummary callSummary={callSummary} onClickFull={mockedAction} />
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
};

export default ContactPreview;
