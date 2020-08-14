import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { withTaskContext, TaskHelper } from '@twilio/flex-ui';

import HrmForm from './HrmForm';
import FormNotEditable from './FormNotEditable';
import { formType, taskType } from '../types';
import { namespace, contactFormsBase, searchContactsBase, routingBase } from '../states';
import { Actions } from '../states/ContactState';
import { handleBlur, handleCategoryToggle, handleFocus, handleValidateForm } from '../states/ActionCreators';
import * as GeneralActions from '../states/actions';
import * as RoutingActions from '../states/routing/actions';
import { handleSelectSearchResult } from '../states/SearchContact';
import { hasTaskControl } from '../utils/transfer';
import callTypes from '../states/DomainConstants';

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
    changeRoute: PropTypes.func.isRequired,
    handleValidateForm: PropTypes.func.isRequired,
    prepopulateForm: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { contactFormStateExists, routingStateExists, searchStateExists } = this.props;
    if (!contactFormStateExists || !routingStateExists || !searchStateExists) {
      // (Gian) maybe this can be used to recreate the form too?
      this.props.recreateContactState(this.props.thisTask.taskSid);
    }
  }

  // eslint-disable-next-line complexity
  render() {
    const { task, thisTask, form } = this.props;

    // If this task is not the active task, or if the task is not accepted yet, hide it
    const show = task && task.taskSid === thisTask.taskSid && !TaskHelper.isPending(task);

    if (!show) {
      return null;
    }

    // If this task came from the pre-survey
    if (task.attributes.memory) {
      /*
       * Conditional to prevent infinite rendering
       * If the user answered the first question, then there will be data to fill in
       */
      const shouldPrepopulateForm =
        task.attributes.memory.twilio.collected_data.collect_survey.answers.about_self.answer &&
        form &&
        !form.childInformation.gender.value;
      if (shouldPrepopulateForm) {
        const { answers } = task.attributes.memory.twilio.collected_data.collect_survey;
        let gender = answers.gender.answer;
        if (gender === undefined) {
          gender = 'Unknown';
        }

        const age = answers.age.answer;
        let ageStr;
        if (age === undefined) {
          ageStr = 'Unknown';
        } else {
          const ageNum = parseInt(age, 10);
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
        }

        /*
         * Currently always populates child information
         * Not sure whether to make a second redux action to populate the caller form
         * Or to have a single redux action which checks a boolean
         */
        this.props.prepopulateForm(gender, ageStr, task.taskSid);

        // Change call type based on survey answers
        const child = answers.about_self.answer === 'Yes';
        if (child) {
          form.callType.value = callTypes.child;
        } else {
          form.callType.value = callTypes.caller;
        }

        // Open tabbed form to first tab
        this.props.changeRoute({ route: 'tabbed-forms' }, task.taskSid);
        this.props.changeTab(1, task.taskSid);
      }
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
  prepopulateForm: bindActionCreators(Actions.prepopulateForm, dispatch),
  recreateContactState: bindActionCreators(GeneralActions.recreateContactState, dispatch),
  changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
});

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(TaskView));
