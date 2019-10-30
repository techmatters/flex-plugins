import React from 'react';
import { withTaskContext } from "@twilio/flex-ui";
import CallTypeButtons from './CallTypeButtons';
import TabbedForms from './TabbedForms';
import { isStandAloneCallType } from '../../states/ValidationRules';

// It is recommended to keep components stateless and use redux for managing states
const HrmForm = (props) => {
  return (
    <>
      {props.form && props.form.callType && !isStandAloneCallType(props.form.callType) ? 
        <TabbedForms form={props.form} handleChange={props.handleChange} handleCheckbox={props.handleCheckbox} handleCallTypeButtonClick={props.handleCallTypeButtonClick} /> :
        <CallTypeButtons form={props.form} handleCallTypeButtonClick={props.handleCallTypeButtonClick} />
      }
    </>
  );
};

export default withTaskContext(HrmForm);