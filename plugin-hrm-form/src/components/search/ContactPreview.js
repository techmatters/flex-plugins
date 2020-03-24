/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, IconButton, Typography } from '@material-ui/core';
import { Fullscreen as FullscreenIcon, Link as LinkIcon, MoreHoriz as MoreHorizIcon } from '@material-ui/icons';

import { ContactWrapper, ContactButtonsWrapper, ContactLabel } from '../../Styles/search';
import { RowDiv } from '../../Styles/HrmStyles';
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

const ContactLabels = ({ label1, label2, label3 }) => (
  <RowDiv style={{ marginLeft: 'auto' }}>
    <ContactLabel>
      <Typography variant="caption">{label1}</Typography>
    </ContactLabel>
    {label2 && (
      <ContactLabel>
        <Typography variant="caption">{label2}</Typography>
      </ContactLabel>
    )}
    {label3 && (
      <ContactLabel>
        <Typography variant="caption">{label3}</Typography>
      </ContactLabel>
    )}
  </RowDiv>
);

ContactLabels.propTypes = {
  label1: PropTypes.string.isRequired,
  label2: PropTypes.string,
  label3: PropTypes.string,
};

ContactLabels.defaultProps = {
  label2: '',
  label3: '',
};

ContactLabels.displayName = 'ContactLabels';

const ContactPreview = ({ contact, onClick, handleConnect }) => {
  const name = contact.overview.name === ' ' ? 'Unknown' : contact.overview.name;

  const callSummary =
    (contact.details.caseInformation.callSummary && contact.details.caseInformation.callSummary.substr(0, 50)) ||
    '- No call summary -';

  const dateString = formatDateString(contact.overview.dateTime);

  return (
    <ContactWrapper key={contact.contactId}>
      <Card style={{ width: 'auto' }} onClick={() => onClick(contact.contactId)}>
        <CardContent>
          <RowDiv>
            <Typography variant="title">{name}</Typography>
            <ContactActionButtons onClickChain={() => handleConnect(contact)} />
          </RowDiv>
          <RowDiv>
            <Typography variant="subtitle1" color="textSecondary">
              {callSummary}
              {callSummary.length === 50 && '...'}
            </Typography>
          </RowDiv>
          <RowDiv>
            <Typography variant="caption" color="textSecondary">
              {dateString}
            </Typography>
            <ContactLabels label1={fstToUpper(contact.overview.callType)} label2="CAT. 2" label3="CAT3" />
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
