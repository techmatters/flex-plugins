import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';

import CallTypeButtons from './CallTypeButtons';
import TabbedForms from './TabbedForms';
import { isStandAloneCallType } from '../states/ValidationRules';
import { formType } from '../types';

// It is recommended to keep components stateless and use redux for managing states
const HrmForm = props => {
  return (
    <>
      {props.form &&
      props.form.callType &&
      props.form.callType.value &&
      !isStandAloneCallType(props.form.callType.value) ? (
        <TabbedForms
          form={props.form}
          handleBlur={props.handleBlur}
          handleCategoryToggle={props.handleCategoryToggle}
          handleChange={props.handleChange}
          handleCallTypeButtonClick={props.handleCallTypeButtonClick}
          handleSubmit={props.handleSubmit}
          handleFocus={props.handleFocus}
          handleSelectSearchResult={props.handleSelectSearchResult}
        />
      ) : (
        <CallTypeButtons
          form={props.form}
          handleCallTypeButtonClick={props.handleCallTypeButtonClick}
          handleSubmit={props.handleSubmit}
        />
      )}
    </>
  );
};

HrmForm.displayName = 'HrmForm';
HrmForm.propTypes = {
  form: formType.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleCategoryToggle: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleCallTypeButtonClick: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleFocus: PropTypes.func.isRequired,
  handleSelectSearchResult: PropTypes.func.isRequired,
};

export default withTaskContext(HrmForm);
