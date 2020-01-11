import React from 'react';
import { StyledInput,
         StyledLabel,
         ErrorText,
         TextField
} from '../Styles/HrmStyles';

      //     <TextField>
      //     <StyledLabel>First name</StyledLabel>
      //     <StyledInput theme={this.props.theme} 
      //       name='firstName'
      //       value={this.props.form.callerInformation.name.firstName}
      //       onChange={(e) => 
      //         this.props.handleChange(taskId,
      //                                 ['callerInformation', 'name'],
      //                                 e)}
      //     />
      // </TextField>
      // error={true}
      // <ErrorText>Required field</ErrorText>

const FieldFirstName = (props) => {
  return (
    <TextField>
      <StyledLabel>First Name</StyledLabel>
      <StyledInput
        error={props.form.callerInformation.name.firstName.error !== null}
        name='firstName'
        value={props.form.callerInformation.name.firstName.value}
        onChange={(e) =>
          props.handleChange(props.taskId,
                             ['callerInformation', 'name'],
                             e)}
      />
      {props.form.callerInformation.name.firstName.error ?
        <ErrorText>{props.form.callerInformation.name.firstName.error}</ErrorText> :
        ''
      }
    </TextField>
  );
};

export default FieldFirstName;
