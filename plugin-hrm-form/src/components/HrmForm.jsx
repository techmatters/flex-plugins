import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';

import CallTypeButtons from './callTypeButtons';
import TabbedForms from './tabbedForms';
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
          handleSubmit={props.handleSubmit}
          handleFocus={props.handleFocus}
          handleSelectSearchResult={props.handleSelectSearchResult}
          changeTab={props.changeTab}
          changeRoute={props.changeRoute}
        />
      );

    case 'new-case':
      return <h1>New Case</h1>;

    case 'select-call-type':
    default:
      return (
        <CallTypeButtons
          form={props.form}
          handleCallTypeButtonClick={props.handleCallTypeButtonClick}
          changeTab={props.changeTab}
          handleSubmit={props.handleSubmit}
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
  handleSubmit: PropTypes.func.isRequired,
  handleFocus: PropTypes.func.isRequired,
  handleSelectSearchResult: PropTypes.func.isRequired,
  changeTab: PropTypes.func.isRequired,
  changeRoute: PropTypes.func.isRequired,
};

export default withTaskContext(HrmForm);
