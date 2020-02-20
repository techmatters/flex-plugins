import React from 'react';
import PropTypes from 'prop-types';

import { StyledInput, StyledLabel, ErrorText, TextField } from '../Styles/HrmStyles';
import RequiredAsterisk from './RequiredAsterisk';
import { fieldType } from '../types';

const FieldText = ({ id, label, field, rows, handleBlur, handleChange, handleFocus }) => (
  <TextField>
    <StyledLabel htmlFor={id}>
      {label}
      <RequiredAsterisk field={field} />
    </StyledLabel>
    <StyledInput
      id={id}
      error={field.error !== null}
      value={field.value}
      multiline={Boolean(rows)}
      rows={rows}
      onBlur={handleBlur}
      onChange={handleChange}
      onFocus={handleFocus}
    />
    {field.error && <ErrorText>{field.error}</ErrorText>}
  </TextField>
);

FieldText.displayName = 'FieldText';
FieldText.defaultProps = {
  rows: undefined,
};

FieldText.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  field: fieldType.isRequired,
  rows: PropTypes.number,
  handleBlur: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleFocus: PropTypes.func.isRequired,
};

export default FieldText;
