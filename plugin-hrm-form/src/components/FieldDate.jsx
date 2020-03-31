import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { StyledInput, StyledLabel, ErrorText, TextField } from '../Styles/HrmStyles';
import RequiredAsterisk from './RequiredAsterisk';
import { fieldType } from '../types';

class FieldDate extends Component {
  static displayName = 'FieldDate';

  static propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
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
        <StyledLabel htmlFor={id}>
          {label}
          <RequiredAsterisk field={field} />
        </StyledLabel>
        <StyledInput
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
