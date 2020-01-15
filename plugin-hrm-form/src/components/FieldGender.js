import React from 'react';
import { ErrorText,
         StyledLabel,
         StyledMenuItem,
         StyledSelect,
         TextField
} from '../Styles/HrmStyles';

{/* <TextField>
<StyledLabel htmlFor="ChildInformation_Gender">Gender</StyledLabel>
<StyledSelect 
  name="gender"
  id="ChildInformation_Gender"
  value={this.props.form.childInformation.gender}
  onChange={(e) => this.props.handleChange(taskId, ['childInformation'], e)}>
  <StyledMenuItem hidden selected disabled value="">Select</StyledMenuItem>
  <StyledMenuItem value="Male">Male</StyledMenuItem>
  <StyledMenuItem value="Female">Female</StyledMenuItem>
  <StyledMenuItem value="Other">Other</StyledMenuItem>
  <StyledMenuItem value="Unknown">Unknown</StyledMenuItem>
</StyledSelect>
</TextField> */}

const FieldGender = (props) => {
  return (
    <TextField>
      <StyledLabel htmlFor="ChildInformation_Gender">Gender<span style={{color: 'red'}}>*</span></StyledLabel>
      <StyledSelect
        error={props.form.childInformation.gender.error !== null}
        name='gender'
        id="ChildInformation_Gender"
        value={props.form.childInformation.gender.value}
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
