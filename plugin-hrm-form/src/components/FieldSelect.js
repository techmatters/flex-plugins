import React from 'react';
import PropTypes from 'prop-types';

import { ErrorText, StyledLabel, StyledMenuItem, StyledSelect, TextField } from '../Styles/HrmStyles';
import RequiredAsterisk from './RequiredAsterisk';
import { fieldType } from '../types';

/**
 *
 * @param {string[] | {label: string, value: any}[]} options
 * An array containing the options of the select component. Can be string
 * or and object containing label and value properties
 * @returns {StyledMenuItem[]} an array of styled MenuItems
 */
const renderOptions = options =>
  options.map(option => {
    switch (typeof option) {
      case 'string':
        return (
          <StyledMenuItem key={option} value={option}>
            {option}
          </StyledMenuItem>
        );
      case 'object':
        return (
          <StyledMenuItem key={option.value} value={option}>
            {option.label}
          </StyledMenuItem>
        );
      default:
        throw new Error('Unexpected option type');
    }
  });

const FieldSelect = ({ id, label, name, field, options, handleBlur, handleChange, handleFocus }) => {
  const renderValue = typeof field.value === 'object' ? option => option.label : option => option;

  return (
    <TextField>
      <StyledLabel htmlFor={id}>
        {label}
        <RequiredAsterisk field={field} />
      </StyledLabel>
      <StyledSelect
        name={name}
        id={id}
        value={field.value}
        style={
          field.error ? { border: '1px solid #CB3232', boxShadow: '0px 0px 0px 2px rgba(234,16,16,0.2)' } : undefined
        }
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        renderValue={renderValue}
      >
        {renderOptions(options)}
      </StyledSelect>
      {field.error && <ErrorText>{field.error}</ErrorText>}
    </TextField>
  );
};

FieldSelect.displayName = 'FieldSelect';
FieldSelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  field: fieldType.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleFocus: PropTypes.func.isRequired,
};

export default FieldSelect;
