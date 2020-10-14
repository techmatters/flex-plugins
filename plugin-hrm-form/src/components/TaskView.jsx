import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { withTaskContext, TaskHelper } from '@twilio/flex-ui';

import HrmForm from './HrmForm';
import FormNotEditable from './FormNotEditable';
import { formType, taskType } from '../types';
import { namespace, contactFormsBase, searchContactsBase, routingBase } from '../states';
import { Actions, handleSelectSearchResult } from '../states/ContactState';
import { handleBlur, handleCategoryToggle, handleFocus, handleValidateForm } from '../states/ActionCreators';
import * as GeneralActions from '../states/actions';
import { hasTaskControl } from '../utils/transfer';

class TaskView extends Component {
  static displayName = 'TaskView';

  static propTypes = {
    task: taskType.isRequired,
    thisTask: taskType.isRequired,
    form: formType.isRequired,
    contactFormStateExists: PropTypes.bool.isRequired,
    routingStateExists: PropTypes.bool.isRequired,
    searchStateExists: PropTypes.bool.isRequired,
    handleBlur: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleCallTypeButtonClick: PropTypes.func.isRequired,
    handleCompleteTask: PropTypes.func.isRequired,
    handleFocus: PropTypes.func.isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
    recreateContactState: PropTypes.func.isRequired,
    changeTab: PropTypes.func.isRequired,
    handleValidateForm: PropTypes.func.isRequired,
  };

  // eslint-disable-next-line complexity
  componentDidMount() {
    const { contactFormStateExists, routingStateExists, searchStateExists } = this.props;
    if (!contactFormStateExists || !routingStateExists || !searchStateExists) {
      // (Gian) maybe this can be used to recreate the form too?
      this.props.recreateContactState(this.props.thisTask.taskSid);
    }
  }

  render() {
    const { task, thisTask, form } = this.props;

    // If this task is not the active task, or if the task is not accepted yet, hide it
    const show = task && task.taskSid === thisTask.taskSid && !TaskHelper.isPending(task);

    if (!show) {
      return null;
    }

    return (
      <div style={{ height: '100%' }}>
        {!hasTaskControl(thisTask) && <FormNotEditable />}
        <HrmForm
          form={form}
          handleBlur={this.props.handleBlur(form, task.taskSid)}
          handleCategoryToggle={handleCategoryToggle(form, this.props.handleChange)}
          handleChange={this.props.handleChange}
          handleCallTypeButtonClick={this.props.handleCallTypeButtonClick}
          handleCompleteTask={this.props.handleCompleteTask}
          handleFocus={this.props.handleFocus}
          handleSelectSearchResult={this.props.handleSelectSearchResult}
          changeTab={this.props.changeTab}
          handleValidateForm={this.props.handleValidateForm(form, task.taskSid)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  // Check if the entry for this task exists in each reducer
  const contactFormStateExists = Boolean(state[namespace][contactFormsBase].tasks[ownProps.thisTask.taskSid]);
  const routingStateExists = Boolean(state[namespace][routingBase].tasks[ownProps.thisTask.taskSid]);
  const searchStateExists = Boolean(state[namespace][searchContactsBase].tasks[ownProps.thisTask.taskSid]);

  // This should already have been created when beforeAcceptTask is fired
  return {
    form: state[namespace][contactFormsBase].tasks[ownProps.thisTask.taskSid],
    contactFormStateExists,
    routingStateExists,
    searchStateExists,
  };
};

const mapDispatchToProps = dispatch => ({
  handleBlur: handleBlur(dispatch),
  handleCallTypeButtonClick: bindActionCreators(Actions.handleCallTypeButtonClick, dispatch),
  handleChange: bindActionCreators(Actions.handleChange, dispatch),
  handleFocus: handleFocus(dispatch),
  handleSelectSearchResult: bindActionCreators(handleSelectSearchResult, dispatch),
  changeTab: bindActionCreators(Actions.changeTab, dispatch),
  handleValidateForm: handleValidateForm(dispatch),
  recreateContactState: bindActionCreators(GeneralActions.recreateContactState, dispatch),
});

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(TaskView));
