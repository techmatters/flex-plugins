import React from 'react';
import { StyledInput,
         StyledLabel,
         ErrorText,
         TextField
} from '../Styles/HrmStyles';
import { ValidationType } from '../states/ContactFormStateFactory';

const requiredAsterisk = store => {
  if (store.validation && store.validation.includes(ValidationType.REQUIRED)) {
    return (
      <span style={{color: 'red'}}>*</span>
    );
  }
  return '';
}

const FieldFirstName = (props) => {
  return (
    <TextField>
      <StyledLabel htmlFor="CallerInformation_FirstName">First Name{requiredAsterisk(props.form.callerInformation.name.firstName)}</StyledLabel>
      <StyledInput
        error={props.form.callerInformation.name.firstName.error !== null}
        name='firstName'
        id="CallerInformation_FirstName"
        value={props.form.callerInformation.name.firstName.value}
        onBlur={() => props.handleBlur()}
        onChange={(e) =>
          props.handleChange(props.taskId,
                             ['callerInformation', 'name'],
                             e)}
        onFocus={() => 
          props.handleFocus(props.taskId,
                            ['callerInformation', 'name'],
                            'firstName')}
      />
      {props.form.callerInformation.name.firstName.error ?
        <ErrorText>{props.form.callerInformation.name.firstName.error}</ErrorText> :
        ''
      }
    </TextField>
  );
};

export default FieldFirstName;
