/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { connect } from 'react-redux';

import { configurationBase, namespace } from '../../states/storeNamespaces';

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
          style={{ padding: '0 20px' }}
          disableUnderline
          labelId={`${TranslateButtonAriaLabel}-label`}
          id={TranslateButtonAriaLabel}
          value={this.props.language}
          onChange={this.handleChange}
          disabled={this.state.loading}
        >
          <MenuItem value="en-US">English</MenuItem>
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

export default connect(mapStateToProps, null)(Translator);
