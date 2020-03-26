import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';

import { RowWithMargin, SummaryText, NoneTransform } from '../../../Styles/search';

const StyledRow = RowWithMargin(5);

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
          <NoneTransform>less notes</NoneTransform>
        </Button>
        <SummaryText>{this.props.callSummary}</SummaryText>
        <Button size="small" color="primary">
          <NoneTransform>See full record</NoneTransform>
        </Button>
      </div>
    ) : (
      <StyledRow>
        <SummaryText>
          {this.shortSummary}
          {this.isLong && '...'}
        </SummaryText>
        {this.isLong && (
          <Button size="small" color="primary" onClick={this.handleClick(true)}>
            <NoneTransform>more notes</NoneTransform>
          </Button>
        )}
      </StyledRow>
    );
  }
}

export default CardRow3;
