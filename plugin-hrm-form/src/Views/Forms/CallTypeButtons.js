import React from 'react';
import { Grid } from '@material-ui/core';
import { ButtonContainer, StyledButton } from '../../Styles/HrmStyles';
import { withTaskContext } from "@twilio/flex-ui";
import { callTypes } from '../../states/DomainConstants';

const CallTypeButtons = (props) => {
  // TODO(nick): Figure out how to get these to be separate
  const buttons = Object.keys(callTypes).map((option) => {
    return (
      <Grid item>
        <StyledButton 
          roundCorners={false}
          theme={props.theme} 
          selected={props.form && props.form.callType === callTypes[option]}
          onClick={(e) => props.handleCallTypeButtonClick(props.task.taskSid, callTypes[option], e)}
        >
          {callTypes[option]}
        </StyledButton>
      </Grid>
    );
  });
  return (
      <ButtonContainer>
        <Grid container>
          { buttons }
        </Grid>
      </ButtonContainer>  
  );
};

export default withTaskContext(CallTypeButtons);
