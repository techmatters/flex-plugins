import React from 'react';
import { ErrorText,
         StyledLabel,
         StyledMenuItem,
         StyledSelect,
         TextField
} from '../Styles/HrmStyles';
import RequiredAsterisk from './RequiredAsterisk';

// The way we're handling errors is pretty terrible, but passing in error={true}
// isn't working
// id = id for form and for
// label = what the user sees
// name = the name of the field
// field = the object in the redux store
// options = an array of options

const renderOptions = options => {
  return options.map(option => (<StyledMenuItem key={option} value={option}>{option}</StyledMenuItem>));
}

const FieldSelect = ({ id, label, name, field, options, handleBlur, handleChange, handleFocus }) =>
  <TextField>
    <StyledLabel htmlFor={id}>
      {label}<RequiredAsterisk field={field} />
    </StyledLabel>
    <StyledSelect
      name={name}
      id={id}
      value={field.value}
      style={field.error
        ? {border: '1px solid #CB3232', boxShadow: '0px 0px 0px 2px rgba(234,16,16,0.2)'}
        : undefined
      }
      onBlur={handleBlur}
      onChange={handleChange}
      onFocus={handleFocus}
    >
      {renderOptions(options)}
    </StyledSelect>
    {field.error && <ErrorText>{field.error}</ErrorText>}
  </TextField>;

export default FieldSelect;
