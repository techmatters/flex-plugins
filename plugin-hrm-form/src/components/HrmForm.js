import React from 'react';
import { withTaskContext } from "@twilio/flex-ui";
import CallTypeButtons from './CallTypeButtons';
import TabbedForms from './TabbedForms';
import { isStandAloneCallType } from '../states/ValidationRules';

// It is recommended to keep components stateless and use redux for managing states
const HrmForm = (props) => {
  return (
    <>
      {props.form && props.form.callType && props.form.callType.value && !isStandAloneCallType(props.form.callType.value) ? 
        <TabbedForms
          form={props.form}
          handleBlur={props.handleBlur}
          handleCategoryToggle={props.handleCategoryToggle}
          handleChange={props.handleChange}
          handleCallTypeButtonClick={props.handleCallTypeButtonClick}
          handleSubmit={props.handleSubmit}
          handleFocus={props.handleFocus} /> :
        <CallTypeButtons
          form={props.form}
          handleCallTypeButtonClick={props.handleCallTypeButtonClick}
          handleSubmit={props.handleSubmit} />
      }
    </>
  );
};

export default withTaskContext(HrmForm);