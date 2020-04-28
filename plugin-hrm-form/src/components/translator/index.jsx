import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { namespace, configurationBase } from '../../states';
import { changeLanguage } from '../../states/ConfigurationState';

class Translator extends React.Component {
  static displayName = 'Translator';

  static propTypes = {
    manager: PropTypes.shape({
      strings: PropTypes.shape({
        TranslateButtonAriaLabel: PropTypes.string,
      }),
    }).isRequired,
    setNewStrings: PropTypes.func.isRequired,
    language: PropTypes.string.isRequired,
    changeLanguage: PropTypes.func.isRequired,
  };

  state = {
    loading: false,
  };

  translate = async language => {
    try {
      const { strings } = this.props.manager;
      const translation = (await import(`../../translations/${language}/translation`)).default;
      const newStrings = { ...strings, ...translation };
      this.props.setNewStrings(newStrings);
      this.props.changeLanguage(language);
      setTimeout(() => this.setState({ loading: false }), 1000);
    } catch (err) {
      console.log('Error while loading translation', err);
    }
  };

  // this function should receive the new language selected (passed via event?)
  handleChange = e => {
    const language = e.target.value;
    if (!this.state.loading && language !== this.props.language) {
      this.setState({ loading: true }, () => this.translate(language));
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
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="es">Español</MenuItem>
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

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeLanguage: bindActionCreators(changeLanguage, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Translator);
