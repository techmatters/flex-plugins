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
// store = the object in the redux store
// options = an array of options
const requiredAsterisk = store => {
  if (store.validation && store.validation.includes(ValidationType.REQUIRED)) {
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
      <StyledLabel htmlFor={props.id}>{props.label}{requiredAsterisk(props.store)}</StyledLabel>
      <StyledSelect
        name={props.name}
        id={props.id}
        value={props.store.value}
        style={props.store.error ?
                {border: '1px solid #CB3232', boxShadow: '0px 0px 0px 2px rgba(234,16,16,0.2)'} : undefined}
        onBlur={() => props.handleBlur()}
        onChange={(e) =>
          props.handleChange(e)}
        onFocus={() => 
          props.handleFocus()}
      >
        {renderOptions(props.options)}
      </StyledSelect>
      {props.store.error ?
        <ErrorText>{props.store.error}</ErrorText> :
        ''
      }
    </TextField>
  );
};

export default FieldSelect;
