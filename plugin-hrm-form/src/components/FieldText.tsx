/* eslint-disable react/prop-types */
import React from 'react';

import { StyledInput, StyledLabel, ErrorText, TextField } from '../styles/HrmStyles';
import RequiredAsterisk from './RequiredAsterisk';
import { FormFieldType } from './common/forms/types';

type OwnProps = {
  id: string;
  label?: string | JSX.Element;
  placeholder?: string;
  field: FormFieldType;
  rows?: number;
  // Someday we should make this consistent with DefaultEventHandlers in /components/common/forms/types.ts
  handleBlur: React.FocusEventHandler<HTMLDivElement | HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleFocus: React.FocusEventHandler<HTMLDivElement | HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
};

const FieldText: React.FC<OwnProps> = ({
  id,
  label,
  placeholder,
  field,
  rows,
  handleBlur,
  handleChange,
  handleFocus,
  ...rest
}) => (
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
      onBlur={handleBlur}
      onChange={handleChange}
      onFocus={handleFocus}
    />
    {field.error && <ErrorText>{field.error}</ErrorText>}
  </TextField>
);

FieldText.displayName = 'FieldText';

FieldText.defaultProps = {
  label: '',
  placeholder: '',
  rows: undefined,
};

export default FieldText;
