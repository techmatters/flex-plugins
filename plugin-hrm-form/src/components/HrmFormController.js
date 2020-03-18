import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTaskContext } from '@twilio/flex-ui';

import TaskView from './TaskView';
import { namespace, contactFormsBase } from '../states';
import { Actions } from '../states/ContactState';
import { handleBlur, handleCategoryToggle, handleFocus, handleSubmit } from '../states/ActionCreators';
import { handleSelectSearchResult } from '../states/SearchContact';
import { taskType } from '../types';

const HrmFormController = props => {
  /*
   * I don't think this should be needed, since we shouldn't be here
   * if there's no task.  But without this check, props.task.taskSid
   * will error when the task is completed, so there may be a lifecycle issue.
   */
  if (!props.task) {
    return null;
  }

  return (
    <TaskView
      thisTask={props.thisTask}
      key={props.task.taskSid}
      form={props.form}
      handleBlur={props.handleBlur(props.form, props.task.taskSid)}
      handleChange={props.handleChange}
      handleCallTypeButtonClick={props.handleCallTypeButtonClick}
      handleCategoryToggle={handleCategoryToggle(props.form, props.handleChange)}
      handleSubmit={props.handleSubmit(props.form, props.handleCompleteTask)}
      handleFocus={props.handleFocus}
      handleSelectSearchResult={props.handleSelectSearchResult}
    />
  );
};

const mapStateToProps = (state, ownProps) => {
  // This should already have been created when beforeAcceptTask is fired
  return {
    form: state[namespace][contactFormsBase].tasks[ownProps.thisTask.taskSid],
  };
};

const mapDispatchToProps = dispatch => ({
  handleBlur: handleBlur(dispatch),
  handleCallTypeButtonClick: bindActionCreators(Actions.handleCallTypeButtonClick, dispatch),
  handleChange: bindActionCreators(Actions.handleChange, dispatch),
  handleFocus: handleFocus(dispatch),
  handleSubmit: handleSubmit(dispatch),
  handleSelectSearchResult: bindActionCreators(handleSelectSearchResult, dispatch),
});

HrmFormController.displayName = 'HrmFormController';
HrmFormController.propTypes = {
  task: taskType.isRequired,
  thisTask: taskType.isRequired,
  form: PropTypes.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleCallTypeButtonClick: PropTypes.func.isRequired,
  handleCompleteTask: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleFocus: PropTypes.func.isRequired,
  handleSelectSearchResult: PropTypes.func.isRequired,
};

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(HrmFormController));
