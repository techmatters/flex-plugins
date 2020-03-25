import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography } from '@material-ui/core';

import { StyledRow } from '../../../Styles/search';

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

export default CardRow3;
