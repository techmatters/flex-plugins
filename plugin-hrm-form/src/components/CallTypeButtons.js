import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';

import { Container, StyledButton, StyledFinishButton } from '../Styles/HrmStyles';
import callTypes from '../states/DomainConstants';
import { isStandAloneCallType } from '../states/ValidationRules';
import { formType, taskType } from '../types';

const CallTypeButtons = props => {
  // TODO(nick): Figure out how to get these to be separate
  const buttons = Object.keys(callTypes).map(option => (
    <StyledButton
      key={option}
      roundCorners={false}
      selected={props.form && props.form.callType.value === callTypes[option]}
      onClick={e => props.handleCallTypeButtonClick(props.task.taskSid, callTypes[option], e)}
    >
      {callTypes[option]}
    </StyledButton>
  ));

  return (
    <Container>
      {buttons}
      {props.form &&
      props.form.callType &&
      props.form.callType.value &&
      isStandAloneCallType(props.form.callType.value) ? (
        <StyledFinishButton
          style={{ marginTop: '20px', border: '2px', backgroundColor: 'red' }}
          roundCorners={true}
          onClick={() => props.handleSubmit(props.task)}
        >
          End conversation and close task
        </StyledFinishButton>
      ) : (
        ''
      )}
    </Container>
  );
};

CallTypeButtons.displayName = 'CallTypeButtons';
CallTypeButtons.propTypes = {
  form: formType.isRequired,
  task: taskType.isRequired,
  handleCallTypeButtonClick: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};
export default withTaskContext(CallTypeButtons);
