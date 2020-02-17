import React from 'react';
import { StyledInput,
  StyledLabel,
  ErrorText,
  TextField
} from '../Styles/HrmStyles';
import { ValidationType } from '../states/ContactFormStateFactory';

const RequiredAsterisk = ({ field }) => {
  const isRequired = field.validation && field.validation.includes(ValidationType.REQUIRED);
  return isRequired && <span style={{color: 'red'}}>*</span>;
}

const FieldText = ({ id, label, field, handleBlur, handleChange, handleFocus }) =>
  <TextField>
    <StyledLabel htmlFor={id}>
      {label}<RequiredAsterisk field={field} />
    </StyledLabel>
    <StyledInput
      id={id}
      error={field.error !== null}
      value={field.value}
      onBlur={handleBlur}
      onChange={handleChange}
      onFocus={handleFocus}
    />
    {field.error && <ErrorText>{field.error}</ErrorText>}
  </TextField>;
          
export default FieldText;
