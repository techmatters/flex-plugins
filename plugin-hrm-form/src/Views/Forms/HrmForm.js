import React from 'react';
import { withTaskContext } from "@twilio/flex-ui";
import CallTypeButtons from './CallTypeButtons';
import TabbedForms from './TabbedForms';
import { Container } from '../../Styles/HrmStyles';
import { isStandAloneCallType } from '../../states/ValidationRules';

// It is recommended to keep components stateless and use redux for managing states
const HrmForm = (props) => {
  return (
    <Container>
      {props.form && props.form.callType && !isStandAloneCallType(props.form.callType) ? 
        <TabbedForms form={props.form} handleChange={props.handleChange} /> :
        <CallTypeButtons form={props.form} handleCallTypeButtonClick={props.handleCallTypeButtonClick} />
      }
    </Container>
  );
};

export default withTaskContext(HrmForm);