import React from 'react';
import { StyledInput,
         StyledLabel,
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

const FieldFirstName = (props) => {
  return (
    <TextField>
      <StyledLabel>First Name</StyledLabel>
      <StyledInput
        name='firstName'
        value={props.form.callerInformation.name.firstName}
        onChange={(e) =>
          props.handleChange(props.taskId,
                             ['callerInformation', 'name'],
                             e)}
      />
    </TextField>
  );
};

export default FieldFirstName;
