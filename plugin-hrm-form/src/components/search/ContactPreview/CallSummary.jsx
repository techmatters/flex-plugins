import React from 'react';
import PropTypes from 'prop-types';

import { Row, Box } from '../../../Styles/HrmStyles';
import { SummaryText, StyledLink } from '../../../Styles/search';

class CallSummary extends React.Component {
  static displayName = 'CallSummary';

  static propTypes = {
    callSummary: PropTypes.string.isRequired,
    onClickFull: PropTypes.func.isRequired,
  };

  state = {
    expanded: false,
  };

  shortSummary = (this.props.callSummary && this.props.callSummary.substr(0, 55)) || '- No call summary -';

  formattedShortSummary = this.shortSummary.replace(/\n/gi, ' ').padEnd(55, ' ');

  isLong = this.shortSummary.length === 55;

  handleClick = bool => event => {
    event.stopPropagation();
    this.setState({ expanded: bool });
  };

  render() {
    return this.state.expanded ? (
      <div>
        <SummaryText>{this.props.callSummary}</SummaryText>
        <StyledLink onClick={this.props.onClickFull}>See full record</StyledLink>
      </div>
    ) : (
      <Box marginBottom="5px">
        <Row style={{ height: '23px' }}>
          <SummaryText>
            {this.formattedShortSummary}
            {this.isLong && '...'}
          </SummaryText>
          {this.isLong && <StyledLink onClick={this.handleClick(true)}>more notes</StyledLink>}
        </Row>
      </Box>
    );
  }
}

export default CallSummary;
