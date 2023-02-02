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

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { StyledInput, StyledLabel, ErrorText, TextField, FormDateInput, FormLabel } from '../styles/HrmStyles';
import RequiredAsterisk from './RequiredAsterisk';
import { fieldType } from '../types';

class FieldDate extends Component {
  static displayName = 'FieldDate';

  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    field: fieldType.isRequired,
    rows: PropTypes.number,
    handleBlur: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleFocus: PropTypes.func.isRequired,
  };

  static defaultProps = {
    placeholder: '',
    rows: null,
    label: '',
  };

  state = {
    isFocused: false,
    type: 'text',
  };

  handleFocus = event => {
    this.setState({ isFocused: true });
    this.props.handleFocus(event);
  };

  handleBlur = event => {
    this.setState({ type: 'text', isFocused: false });
    this.props.handleBlur(event);
  };

  handleMouseEnter = () => this.setState({ type: 'date' });

  handleMouseLeave = () => !this.state.isFocused && this.setState({ type: 'text' });

  render() {
    const { id, label, placeholder, field, rows, handleBlur, handleChange, handleFocus, ...rest } = this.props;
    const { type } = this.state;

    return (
      <TextField {...rest}>
        {label && (
          <FormLabel htmlFor={id}>
            {label}
            <RequiredAsterisk field={field} />
          </FormLabel>
        )}
        <FormDateInput
          id={id}
          placeholder={placeholder}
          error={field.error !== null}
          value={field.value}
          multiline={Boolean(rows)}
          rows={rows}
          type={type}
          pattern="yyyy-mm-dd"
          onChange={handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          style={{ width: '110px' }}
        />
        {field.error && <ErrorText>{field.error}</ErrorText>}
      </TextField>
    );
  }
}

export default FieldDate;
