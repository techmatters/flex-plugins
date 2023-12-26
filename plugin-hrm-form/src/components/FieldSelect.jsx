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

/* eslint-disable sonarjs/no-extra-arguments */
import React from 'react';
import PropTypes from 'prop-types';

import { ErrorText, FormLabel, FormSelect, StyledLabel, StyledMenuItem, StyledSelect, TextField } from '../styles';
import RequiredAsterisk from './RequiredAsterisk';
import { fieldType, counselorType } from '../types';

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

/**
 * @type {React.FC<any>}
 */
const FieldSelect = ({
  id,
  label,
  placeholder,
  name,
  field,
  options,
  handleBlur,
  handleChange,
  handleFocus,
  ...rest
}) => {
  const isPlaceholder = !(typeof field.value === 'object' ? Boolean(field.value.label) : Boolean(field.value));

  const renderValue =
    typeof field.value === 'object' ? option => option.label || placeholder : option => option || placeholder;

  return (
    <TextField {...rest}>
      <FormLabel htmlFor={id}>
        {label}
        <RequiredAsterisk field={field} />
      </FormLabel>
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
        isPlaceholder={isPlaceholder}
      >
        {renderOptions(options, placeholder)}
      </StyledSelect>
      {field.error && <ErrorText>{field.error}</ErrorText>}
    </TextField>
  );
};

FieldSelect.displayName = 'FieldSelect';
FieldSelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  name: PropTypes.string.isRequired,
  field: fieldType.isRequired,
  options: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, counselorType])).isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleFocus: PropTypes.func.isRequired,
};
FieldSelect.defaultProps = {
  placeholder: '',
};

export default FieldSelect;
