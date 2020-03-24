/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardContent, IconButton, Typography } from '@material-ui/core';
import { Fullscreen as FullscreenIcon, Link as LinkIcon, MoreHoriz as MoreHorizIcon } from '@material-ui/icons';

import {
  RowDiv,
  ContactWrapper,
  ContactButtonsWrapper,
  ContactCallType,
  ContactTag,
  ContactDate,
  TagFont,
} from '../../Styles/search';
import { searchContactResult } from '../../types';

/**
 * @param {string} str
 * @return {string}
 */
const fstToUpper = str => {
  return str.split(' ')[0].toUpperCase();
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * @param {string} str
 * @return {string}
 */
const formatDateString = dateStr => {
  const d = new Date(dateStr);
  const month = d.getMonth();
  const day = d.getDay();
  const year = d.getFullYear();
  const time = `${d.getHours()}:${d.getMinutes()}`;
  return `${months[month]} ${day}, ${year} ${time}`;
};

const ContactActionButtons = ({ onClickChain }) => (
  <ContactButtonsWrapper>
    <IconButton onClick={onClickChain}>
      <LinkIcon />
    </IconButton>
    <IconButton>
      <FullscreenIcon />
    </IconButton>
    <IconButton>
      <MoreHorizIcon />
    </IconButton>
  </ContactButtonsWrapper>
);

ContactActionButtons.propTypes = {
  onClickChain: PropTypes.func.isRequired,
};

ContactActionButtons.displayName = 'ContactActionButtons';

const ContactTags = ({ tag1, tag2, tag3 }) => (
  <RowDiv style={{ marginLeft: 'auto' }}>
    {tag1 && (
      <ContactTag>
        <TagFont>{tag1}</TagFont>
      </ContactTag>
    )}
    {tag2 && (
      <ContactTag>
        <TagFont>{tag2}</TagFont>
      </ContactTag>
    )}
    {tag3 && (
      <ContactTag>
        <TagFont>{tag3}</TagFont>
      </ContactTag>
    )}
  </RowDiv>
);

ContactTags.propTypes = {
  tag1: PropTypes.string,
  tag2: PropTypes.string,
  tag3: PropTypes.string,
};

ContactTags.defaultProps = {
  tag1: '',
  tag2: '',
  tag3: '',
};

ContactTags.displayName = 'ContactLabels';

const ContactPreview = ({ contact, onClick, handleConnect }) => {
  const name = contact.overview.name === ' ' ? 'Unknown' : contact.overview.name;

  const callSummary =
    (contact.details.caseInformation.callSummary && contact.details.caseInformation.callSummary.substr(0, 50)) ||
    '- No call summary -';

  const longSummary = callSummary.length === 50;

  const dateString = formatDateString(contact.overview.dateTime);

  return (
    <ContactWrapper key={contact.contactId}>
      <Card onClick={() => onClick(contact.contactId)}>
        <CardContent>
          <RowDiv>
            <Typography variant="subtitle1">{name}</Typography>
            <ContactActionButtons onClickChain={() => handleConnect(contact)} />
          </RowDiv>
          <RowDiv>
            <ContactCallType>
              <TagFont>{fstToUpper(contact.overview.callType)}</TagFont>
            </ContactCallType>
            <Typography variant="subtitle2">Counselor: {contact.overview.counselor}</Typography>
          </RowDiv>
          <RowDiv>
            <Typography variant="subtitle2" color="textSecondary">
              {callSummary}
              {longSummary && '...'}
              {longSummary && (
                <Button size="small" autoCapitalize={false} color="primary">
                  more notes
                </Button>
              )}
            </Typography>
          </RowDiv>
          <RowDiv>
            {/* <Typography variant="caption" color="textSecondary">
              {dateString}
            </Typography> */}
            <ContactDate>{dateString}</ContactDate>
            <ContactTags tag1="TAG 1" tag2="TAG 2" tag3="TAG 3" />
          </RowDiv>
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
