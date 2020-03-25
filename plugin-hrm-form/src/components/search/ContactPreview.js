/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardContent, IconButton, Typography } from '@material-ui/core';
import { Fullscreen as FullscreenIcon, Link as LinkIcon, MoreHoriz as MoreHorizIcon } from '@material-ui/icons';

import { Row } from '../../Styles/HrmStyles';
import {
  StyledRow,
  ContactWrapper,
  ContactButtonsWrapper,
  ContactCallType,
  ContactTag,
  LightFont,
  TagFont,
} from '../../Styles/search';
import { searchContactResult } from '../../types';

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
 * Formats the date in a clearer way than its received in contact
 * @param {string} dateStr
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

const CardRow1 = ({ name, onClickChain }) => (
  <StyledRow>
    <Typography variant="subtitle1">{name}</Typography>
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
  </StyledRow>
);

CardRow1.propTypes = {
  name: PropTypes.string.isRequired,
  onClickChain: PropTypes.func.isRequired,
};

CardRow1.displayName = 'CardRow1';

const CardRow2 = ({ callType, counselor }) => (
  <StyledRow>
    <ContactCallType>
      <TagFont>{callType}</TagFont>
    </ContactCallType>
    <Row>
      <LightFont style={{ marginRight: 5 }}>Counselor: </LightFont>
      <Typography variant="subtitle2">{counselor}</Typography>
    </Row>
  </StyledRow>
);

CardRow2.propTypes = {
  callType: PropTypes.string.isRequired,
  counselor: PropTypes.string.isRequired,
};

CardRow2.displayName = 'CardRow2';

class CardRow3 extends React.Component {
  static displayName = 'CardRow3';

  static propTypes = {
    callSummary: PropTypes.string.isRequired,
  };

  state = {
    expanded: false,
  };

  shortSummary = (this.props.callSummary && this.props.callSummary.substr(0, 50)) || '- No call summary -';

  isLong = this.shortSummary.length === 50;

  handleClick = bool => event => {
    event.stopPropagation();
    this.setState({ expanded: bool });
  };

  render() {
    return this.state.expanded ? (
      <div>
        <Button size="small" color="primary" onClick={this.handleClick(false)}>
          less notes
        </Button>
        <Typography variant="subtitle2" color="textSecondary">
          {this.props.callSummary}
        </Typography>
      </div>
    ) : (
      <StyledRow>
        <Typography variant="subtitle2" color="textSecondary">
          {this.shortSummary}
          {this.isLong && '...'}
        </Typography>
        {this.isLong && (
          <Button size="small" color="primary" onClick={this.handleClick(true)}>
            more notes
          </Button>
        )}
      </StyledRow>
    );
  }
}

const CardRow4 = ({ dateString, tag1, tag2, tag3 }) => (
  <StyledRow>
    <LightFont>{dateString}</LightFont>
    <Row style={{ marginLeft: 'auto' }}>
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
    </Row>
  </StyledRow>
);

CardRow4.propTypes = {
  dateString: PropTypes.string.isRequired,
  tag1: PropTypes.string,
  tag2: PropTypes.string,
  tag3: PropTypes.string,
};

CardRow4.defaultProps = {
  tag1: '',
  tag2: '',
  tag3: '',
};

CardRow4.displayName = 'ContactLabels';

const ContactPreview = ({ contact, onClick, handleConnect }) => {
  const name = contact.overview.name === ' ' ? 'Unknown' : contact.overview.name;

  const dateString = formatDateString(contact.overview.dateTime);

  return (
    <ContactWrapper key={contact.contactId}>
      <Card onClick={() => onClick(contact.contactId)}>
        <CardContent>
          {/** child's name and action buttons */}
          <CardRow1 name={name} onClickChain={() => handleConnect(contact)} />
          {/** call type and counselor's name */}
          <CardRow2 callType={fstToUpper(contact.overview.callType)} counselor={contact.counselor} />
          {/** call summary (notes) */}
          <CardRow3 callSummary={contact.details.caseInformation.callSummary} />
          {/** date and call tags */}
          <CardRow4 dateString={dateString} tag1="TAG 1" tag2="TAG 2" tag3="TAG 3" />
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
