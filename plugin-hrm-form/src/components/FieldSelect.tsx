/* eslint-disable react/prop-types */
import React from 'react';

import { ErrorText, StyledLabel, StyledMenuItem, StyledSelect, TextField } from '../styles/HrmStyles';
import RequiredAsterisk from './RequiredAsterisk';
import { Counselor, FormFieldSelectType } from './common/forms/types';

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

type OwnProps = {
  id: string;
  label?: string | JSX.Element;
  placeholder?: string;
  name: string;
  field: FormFieldSelectType;
  options: Array<string | Counselor>;
  handleBlur: any;
  handleChange: any;
  handleFocus: any;
};

const FieldSelect: React.FC<OwnProps> = ({
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
        isPlaceholder={isPlaceholder}
      >
        {renderOptions(options)}
      </StyledSelect>
      {field.error && <ErrorText>{field.error}</ErrorText>}
    </TextField>
  );
};

FieldSelect.displayName = 'FieldSelect';
FieldSelect.defaultProps = {
  placeholder: '',
};

export default FieldSelect;
