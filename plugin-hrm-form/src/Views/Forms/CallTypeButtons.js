import React from 'react';
import { Container, StyledButton, StyledFinishButton } from '../../Styles/HrmStyles';
import { withTaskContext } from "@twilio/flex-ui";
import { callTypes } from '../../states/DomainConstants';
import { isStandAloneCallType } from '../../states/ValidationRules';

const CallTypeButtons = (props) => {
  // TODO(nick): Figure out how to get these to be separate
  const buttons = Object.keys(callTypes).map((option) => {
    return (
      <StyledButton 
        roundCorners={false}
        theme={props.theme} 
        selected={props.form && props.form.callType === callTypes[option]}
        onClick={(e) => props.handleCallTypeButtonClick(props.task.taskSid, callTypes[option], e)}
      >
        {callTypes[option]}
      </StyledButton>
    );
  });
  return (
      <Container>
        { buttons }
        {props.form && props.form.callType && isStandAloneCallType(props.form.callType)
          ? 
            <StyledFinishButton
              style={{marginTop: '20px', border: '2px', backgroundColor: 'red'}}
              roundCorners={true}
              theme={props.theme}
              onClick={(e) => props.handleCompleteTask(props.task.taskSid, props.task)}
            >
              End conversation and close task
            </StyledFinishButton>
          : ''}
          { /* So I think that when the complete task action is fired, our beforeComplete will automatically save it */ }
      </Container>  
  );
};

export default withTaskContext(CallTypeButtons);
