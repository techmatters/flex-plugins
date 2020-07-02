import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';

import CallTypeButtons from './callTypeButtons';
import TabbedForms from './tabbedForms';
import Case from './case';
import { formType } from '../types';

const HrmForm = props => {
  const route = props.form && props.form.metadata && props.form.metadata.route;

  switch (route) {
    case 'tabbed-forms':
      return (
        <TabbedForms
          form={props.form}
          handleBlur={props.handleBlur}
          handleCategoryToggle={props.handleCategoryToggle}
          handleChange={props.handleChange}
          handleCallTypeButtonClick={props.handleCallTypeButtonClick}
          handleFocus={props.handleFocus}
          handleSelectSearchResult={props.handleSelectSearchResult}
          changeTab={props.changeTab}
          changeRoute={props.changeRoute}
          handleCompleteTask={props.handleCompleteTask}
          handleValidateForm={props.handleValidateForm}
        />
      );

    case 'new-case':
      return <Case handleCompleteTask={props.handleCompleteTask} />;

    case 'select-call-type':
    default:
      return (
        <CallTypeButtons
          form={props.form}
          handleCallTypeButtonClick={props.handleCallTypeButtonClick}
          changeTab={props.changeTab}
          handleCompleteTask={props.handleCompleteTask}
          changeRoute={props.changeRoute}
        />
      );
  }
};

HrmForm.displayName = 'HrmForm';
HrmForm.propTypes = {
  form: formType.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleCategoryToggle: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleCallTypeButtonClick: PropTypes.func.isRequired,
  handleCompleteTask: PropTypes.func.isRequired,
  handleFocus: PropTypes.func.isRequired,
  handleSelectSearchResult: PropTypes.func.isRequired,
  changeTab: PropTypes.func.isRequired,
  changeRoute: PropTypes.func.isRequired,
  handleValidateForm: PropTypes.func.isRequired,
};

export default withTaskContext(HrmForm);
