import React from 'react';
import PropTypes from 'prop-types';
import { truncate } from 'lodash';
import { Template } from '@twilio/flex-ui';

import { Row, Box } from '../../../styles/HrmStyles';
import { SummaryText, ShortSummaryText, StyledLink } from '../../../styles/search';

const CHAR_LIMIT = 45;

class CallSummary extends React.Component {
  static displayName = 'CallSummary';

  static propTypes = {
    callSummary: PropTypes.string.isRequired,
    onClickFull: PropTypes.func.isRequired,
  };

  state = {
    expanded: false,
  };

  getShortSummary() {
    const { callSummary } = this.props;

    if (!callSummary) {
      return <Template code="CallSummary-None" />;
    }

    return truncate(callSummary, {
      length: CHAR_LIMIT,
      separator: /,?\.* +/, // TODO(murilo): Check other punctuations
    });
  }

  handleClick = bool => event => {
    event.stopPropagation();
    this.setState({ expanded: bool });
  };

  render() {
    const { callSummary } = this.props;
    const isLong = callSummary.length > CHAR_LIMIT;

    return this.state.expanded ? (
      <div>
        <SummaryText>{this.props.callSummary}</SummaryText>
        <StyledLink onClick={this.props.onClickFull}>
          <Template code="CallSummary-ViewFull" />
        </StyledLink>
      </div>
    ) : (
      <Box marginBottom="5px">
        <Row style={{ height: '23px' }}>
          <ShortSummaryText>{this.getShortSummary()}</ShortSummaryText>
          {isLong && (
            <StyledLink onClick={this.handleClick(true)}>
              <Template code="CallSummary-MoreNotes" />
            </StyledLink>
          )}
        </Row>
      </Box>
    );
  }
}

export default CallSummary;
