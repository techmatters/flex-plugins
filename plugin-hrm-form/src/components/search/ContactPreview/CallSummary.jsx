import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';

import { Row } from '../../../styles/HrmStyles';
import { SummaryText, ShortSummaryText, StyledLink } from '../../../styles/search';
import { getShortSummary } from '../../../utils';

const CHAR_LIMIT = 65;

class CallSummary extends React.Component {
  static displayName = 'CallSummary';

  static propTypes = {
    callSummary: PropTypes.string.isRequired,
    onClickFull: PropTypes.func.isRequired,
  };

  state = {
    expanded: false,
  };

  handleClick = bool => event => {
    event.stopPropagation();
    this.setState({ expanded: bool });
  };

  render() {
    const { callSummary } = this.props;

    const isLong = callSummary && callSummary.length > CHAR_LIMIT;

    return this.state.expanded ? (
      <div>
        <SummaryText>{callSummary}</SummaryText>
        <StyledLink onClick={this.props.onClickFull}>
          <Template code="CallSummary-ViewFull" />
        </StyledLink>
      </div>
    ) : (
      <Row style={{ height: '23px' }}>
        <ShortSummaryText>{getShortSummary(callSummary, CHAR_LIMIT)}</ShortSummaryText>
        {isLong && (
          <StyledLink onClick={this.handleClick(true)}>
            <Template code="CallSummary-MoreNotes" />
          </StyledLink>
        )}
      </Row>
    );
  }
}

export default CallSummary;
