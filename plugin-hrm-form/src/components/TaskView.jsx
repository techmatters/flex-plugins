import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { withTaskContext, TaskHelper } from '@twilio/flex-ui';

import HrmForm from './HrmForm';
import FormNotEditable from './FormNotEditable';
import { formType, taskType } from '../types';
import { namespace, contactFormsBase, searchContactsBase } from '../states';
import { Actions } from '../states/ContactState';
import { handleBlur, handleCategoryToggle, handleFocus, handleValidateForm } from '../states/ActionCreators';
import { handleSelectSearchResult, recreateSearchContact } from '../states/SearchContact';
import { hasTaskControl } from '../utils/transfer';

class TaskView extends Component {
  static displayName = 'TaskView';

  static propTypes = {
    task: taskType.isRequired,
    thisTask: taskType.isRequired,
    form: formType.isRequired,
    searchStateExists: PropTypes.bool.isRequired,
    handleBlur: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleCallTypeButtonClick: PropTypes.func.isRequired,
    handleCompleteTask: PropTypes.func.isRequired,
    handleFocus: PropTypes.func.isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
    recreateSearchContact: PropTypes.func.isRequired,
    changeTab: PropTypes.func.isRequired,
    changeRoute: PropTypes.func.isRequired,
    handleValidateForm: PropTypes.func.isRequired,
    prepopulateForm: PropTypes.func.isRequired,
  };

  componentDidMount() {
    if (!this.props.searchStateExists) {
      // (Gian) maybe this can be used to recreate the form too?
      this.props.recreateSearchContact(this.props.thisTask.taskSid);
    }
  }

  render() {
    const { task, thisTask, form } = this.props;

    // If this task is not the active task, or if the task is not accepted yet, hide it
    const show = task && task.taskSid === thisTask.taskSid && !TaskHelper.isPending(task);

    if (!show) {
      return null;
    }

    console.log(task);
    if (task.attributes.memory) {
      const { answers } = task.attributes.memory.twilio.collected_data.collect_caller_info;
      const gender = answers.gender.answer;
      const ageNum = parseInt(answers.age.answer, 10);
      let ageStr;
      if (ageNum >= 0 && ageNum <= 3) {
        ageStr = '0-03';
      } else if (ageNum >= 4 && ageNum <= 6) {
        ageStr = '04-06';
      } else if (ageNum >= 7 && ageNum <= 9) {
        ageStr = '07-09';
      } else if (ageNum >= 10 && ageNum <= 12) {
        ageStr = '10-12';
      } else if (ageNum >= 13 && ageNum <= 15) {
        ageStr = '13-15';
      } else if (ageNum >= 16 && ageNum <= 17) {
        ageStr = '16-17';
      } else if (ageNum >= 18 && ageNum <= 25) {
        ageStr = '18-25';
      } else {
        ageStr = '>25';
      }

      this.props.prepopulateForm(gender, ageStr, task.taskSid);
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
          changeRoute={this.props.changeRoute}
          handleValidateForm={this.props.handleValidateForm(form, task.taskSid)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  // Check if the entry for this task exists in searchContacts
  const searchStateExists = Boolean(state[namespace][searchContactsBase].tasks[ownProps.thisTask.taskSid]);

  // This should already have been created when beforeAcceptTask is fired
  return {
    form: state[namespace][contactFormsBase].tasks[ownProps.thisTask.taskSid],
    searchStateExists,
  };
};

const mapDispatchToProps = dispatch => ({
  handleBlur: handleBlur(dispatch),
  handleCallTypeButtonClick: bindActionCreators(Actions.handleCallTypeButtonClick, dispatch),
  handleChange: bindActionCreators(Actions.handleChange, dispatch),
  handleFocus: handleFocus(dispatch),
  handleSelectSearchResult: bindActionCreators(handleSelectSearchResult, dispatch),
  recreateSearchContact: bindActionCreators(recreateSearchContact, dispatch),
  changeTab: bindActionCreators(Actions.changeTab, dispatch),
  changeRoute: bindActionCreators(Actions.changeRoute, dispatch),
  handleValidateForm: handleValidateForm(dispatch),
  prepopulateForm: bindActionCreators(Actions.prepopulateForm, dispatch),
});

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(TaskView));
