import React from 'react';
import { ErrorText,
         StyledLabel,
         StyledMenuItem,
         StyledSelect,
         TextField
} from '../Styles/HrmStyles';

// Delete this soon.
// The way we're handling errors is pretty terrible, but passing in error={true}
// isn't working
const FieldGender = (props) => {
  return (
    <TextField>
      <StyledLabel htmlFor="ChildInformation_Gender">Gender<span style={{color: 'red'}}>*</span></StyledLabel>
      <StyledSelect
        name='gender'
        id="ChildInformation_Gender"
        value={props.form.childInformation.gender.value}
        style={props.form.childInformation.gender.error ?
                {border: '1px solid #CB3232', boxShadow: '0px 0px 0px 2px rgba(234,16,16,0.2)'} : undefined}
        onBlur={() => props.handleBlur()}
        onChange={(e) =>
          props.handleChange(props.taskId,
                             ['childInformation'],
                             e)}
        onFocus={() => 
          props.handleFocus(props.taskId,
                            ['childInformation'],
                            'gender')}
      >
        <StyledMenuItem value="Male">Male</StyledMenuItem>
        <StyledMenuItem value="Female">Female</StyledMenuItem>
        <StyledMenuItem value="Other">Other</StyledMenuItem>
        <StyledMenuItem value="Unknown">Unknown</StyledMenuItem>
      </StyledSelect>
      {props.form.childInformation.gender.error ?
        <ErrorText>{props.form.childInformation.gender.error}</ErrorText> :
        ''
      }
    </TextField>
  );
};

export default FieldGender;
