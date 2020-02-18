import React from 'react';
import { StyledInput,
  StyledLabel,
  ErrorText,
  TextField
} from '../Styles/HrmStyles';
import RequiredAsterisk from './RequiredAsterisk';

const FieldText = ({ id, label, field, rows, handleBlur, handleChange, handleFocus }) =>
  <TextField>
    <StyledLabel htmlFor={id}>
      {label}<RequiredAsterisk field={field} />
    </StyledLabel>
    <StyledInput
      id={id}
      error={field.error !== null}
      value={field.value}
      multiline={!!rows}
      rows={rows}
      onBlur={handleBlur}
      onChange={handleChange}
      onFocus={handleFocus}
    />
    {field.error && <ErrorText>{field.error}</ErrorText>}
  </TextField>;
          
export default FieldText;
