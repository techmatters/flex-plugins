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

const FieldText = ({ label, parents, name, field, taskId, handleBlur, handleChange, handleFocus }) => {
  const id = [...parents, name].join('_');

  return (
    <TextField>
      <StyledLabel htmlFor={id}>
        {label}<RequiredAsterisk field={field} />
      </StyledLabel>
      <StyledInput
        error={field.error !== null}
        name={name}
        id={id}
        value={field.value}
        onBlur={handleBlur}
        onChange={(e) => handleChange(taskId, parents, e)}
        onFocus={() => handleFocus(taskId, parents, name)}
      />
      {field.error && <ErrorText>{field.error}</ErrorText>}
    </TextField>
  );
};
          
export default FieldText;
