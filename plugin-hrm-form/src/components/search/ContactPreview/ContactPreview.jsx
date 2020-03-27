import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Card, CardContent } from '@material-ui/core';

import { ContactWrapper } from '../../../Styles/search';
import CardRow1 from './CardRow1';
import CardRow2 from './CardRow2';
import CardRow3 from './CardRow3';
import CardRow4 from './CardRow4';
import { searchContactResult } from '../../../types';

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
const mapAndToUpper = str => {
  const fst = str.split(' ')[0].toUpperCase();
  const mapped = mapper(fst);
  return mapped;
};

const ContactPreview = ({ contact, onClick, handleConnect }) => {
  const name = (contact.overview.name === ' ' ? 'Unknown' : contact.overview.name).toUpperCase();

  // const dateString = formatDateString(contact.overview.dateTime);
  const dateString = moment(contact.overview.dateTime).format('MMM DD, YYYY HH:mm a');

  const [tag1, tag2, tag3] = contact.tags;

  const mockedAction = () => onClick('Not implemented yet');

  return (
    <ContactWrapper key={contact.contactId}>
      <Card>
        <CardContent>
          {/** child's name and action buttons */}
          <CardRow1 name={name} onClickChain={handleConnect} onClickFull={mockedAction} onClickMore={mockedAction} />
          {/** call type and counselor's name */}
          <CardRow2 callType={mapAndToUpper(contact.overview.callType)} counselor={contact.counselor} />
          {/** call summary (notes) */}
          <CardRow3 callSummary={contact.details.caseInformation.callSummary} />
          {/** date and call tags */}
          <CardRow4 dateString={dateString} tag1={tag1} tag2={tag2} tag3={tag3} />
        </CardContent>
      </Card>
    </ContactWrapper>
  );
};

ContactPreview.displayName = 'ContactPreview';

ContactPreview.propTypes = {
  contact: searchContactResult.isRequired,
  onClick: PropTypes.func.isRequired,
  handleConnect: PropTypes.func.isRequired,
};

export default ContactPreview;
