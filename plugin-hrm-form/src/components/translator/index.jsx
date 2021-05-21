import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { connect } from 'react-redux';

import { namespace, configurationBase } from '../../states';

class Translator extends React.PureComponent {
  static displayName = 'Translator';

  static propTypes = {
    manager: PropTypes.shape({
      strings: PropTypes.shape({
        TranslateButtonAriaLabel: PropTypes.string,
      }),
    }).isRequired,
    translateUI: PropTypes.func.isRequired,
    language: PropTypes.string.isRequired,
  };

  state = {
    loading: false,
  };

  // receives the new language selected (passed via event value)
  handleChange = e => {
    const language = e.target.value;
    if (!this.state.loading && language !== this.props.language) {
      this.setState({ loading: true }, async () => {
        await this.props.translateUI(language);
        setTimeout(() => this.setState({ loading: false }), 1000);
      });
    }
  };

  render() {
    const { TranslateButtonAriaLabel } = this.props.manager.strings;

    return (
      <FormControl variant="filled">
        <InputLabel id={`${TranslateButtonAriaLabel}-label`}>{TranslateButtonAriaLabel}</InputLabel>
        <Select
          labelId={`${TranslateButtonAriaLabel}-label`}
          id={TranslateButtonAriaLabel}
          value={this.props.language}
          onChange={this.handleChange}
          disabled={this.state.loading}
        >
          <MenuItem value="en-US">English</MenuItem>
          <MenuItem value="es">Español</MenuItem>
          <MenuItem value="garbled">Garbled</MenuItem>
        </Select>
        {this.state.loading && <CircularProgress style={{ position: 'absolute', flex: 1 }} />}
      </FormControl>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const configurationState = state[namespace][configurationBase];

  return {
    language: configurationState.language,
  };
};

export default connect(mapStateToProps, null)(Translator);
