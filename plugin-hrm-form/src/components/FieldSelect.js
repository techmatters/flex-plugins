import React from 'react';
import { ErrorText,
         StyledLabel,
         StyledMenuItem,
         StyledSelect,
         TextField
} from '../Styles/HrmStyles';
import { ValidationType } from '../states/ContactFormStateFactory';

// The way we're handling errors is pretty terrible, but passing in error={true}
// isn't working
// id = id for form and for
// label = what the user sees
// name = the name of the field
// field = the object in the redux store
// options = an array of options
const requiredAsterisk = field => {
  if (field.validation && field.validation.includes(ValidationType.REQUIRED)) {
    return (
      <span style={{color: 'red'}}>*</span>
    );
  }
  return '';
}

const renderOptions = options => {
  return options.map(option => (<StyledMenuItem key={option} value={option}>{option}</StyledMenuItem>));
}

const FieldSelect = (props) => {
  return (
    <TextField>
      <StyledLabel htmlFor={props.id}>{props.label}{requiredAsterisk(props.field)}</StyledLabel>
      <StyledSelect
        name={props.name}
        id={props.id}
        value={props.field.value}
        style={props.field.error ?
                {border: '1px solid #CB3232', boxShadow: '0px 0px 0px 2px rgba(234,16,16,0.2)'} : undefined}
        onBlur={props.handleBlur}
        onChange={props.handleChange}
        onFocus={props.handleFocus}
      >
        {renderOptions(props.options)}
      </StyledSelect>
      {props.field.error ?
        <ErrorText>{props.field.error}</ErrorText> :
        ''
      }
    </TextField>
  );
};

export default FieldSelect;
