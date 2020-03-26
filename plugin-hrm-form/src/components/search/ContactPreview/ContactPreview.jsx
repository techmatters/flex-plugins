import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '@material-ui/core';

import { ContactWrapper } from '../../../Styles/search';
import CardRow1 from './CardRow1';
import CardRow2 from './CardRow2';
import CardRow3 from './CardRow3';
import CardRow4 from './CardRow4';
import { searchContactResult } from '../../../types';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns first word of the string as uppercase
 * @param {string} str
 * @return {string}
 */
const fstToUpper = str => {
  return str.split(' ')[0].toUpperCase();
};

/**
 * Formats the date in a 12-hours clock style
 * @param {string} dateStr
 * @return {string}
 */
const formatDateString = dateStr => {
  const d = new Date(dateStr);
  const month = d.getMonth();
  const day = d.getDay();
  const year = d.getFullYear();
  const h = d.getHours();
  const in12 = h % 2;
  const hours = in12 ? in12 : 12; // hour "00" is displayed as "12"
  const m = d.getMinutes();
  const minutes = m < 10 ? `0${m}` : m;
  const meridiem = h > 11 ? 'pm' : 'am';
  return `${months[month]} ${day}, ${year} ${hours}:${minutes}${meridiem}`;
};

const ContactPreview = ({ contact, onClick, handleConnect }) => {
  const name = (contact.overview.name === ' ' ? 'Unknown' : contact.overview.name).toUpperCase();

  const dateString = formatDateString(contact.overview.dateTime);

  const [tag1, tag2, tag3] = contact.tags;

  return (
    <ContactWrapper key={contact.contactId}>
      <Card onClick={() => onClick(`contact: ${contact.contactId}\ndate: ${contact.overview.dateTime}`)}>
        <CardContent>
          {/** child's name and action buttons */}
          <CardRow1 name={name} onClickChain={handleConnect} />
          {/** call type and counselor's name */}
          <CardRow2 callType={fstToUpper(contact.overview.callType)} counselor={contact.counselor} />
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
