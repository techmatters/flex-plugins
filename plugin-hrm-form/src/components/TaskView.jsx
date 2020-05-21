import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';

import HrmForm from './HrmForm';
import { formType, taskType } from '../types';
import { namespace, contactFormsBase, searchContactsBase } from '../states';
import { Actions } from '../states/ContactState';
import { handleBlur, handleCategoryToggle, handleFocus, handleSubmit } from '../states/ActionCreators';
import { handleSelectSearchResult, recreateSearchContact } from '../states/SearchContact';
import { shouldSubmitForm } from './transfer/helpers';

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
    handleSubmit: PropTypes.func.isRequired,
    handleFocus: PropTypes.func.isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
    recreateSearchContact: PropTypes.func.isRequired,
    changeTab: PropTypes.func.isRequired,
  };

  componentDidMount() {
    if (!this.props.searchStateExists) {
      // (Gian) maybe this can be used to recreate the form too?
      this.props.recreateSearchContact(this.props.thisTask.taskSid);
    }
  }

  render() {
    const { task, thisTask, form } = this.props;

    // If this task is not the active task, hide it
    const show = task && task.taskSid === thisTask.taskSid;

    if (!show) {
      return null;
    }

    return (
      <div style={{ height: '100%' }}>
        {shouldSubmitForm(thisTask) && <p>WILL HIDE WILL HIDE WILL HIDE WILL HIDE WILL HIDE</p>}
        <HrmForm
          form={form}
          handleBlur={this.props.handleBlur(form, task.taskSid)}
          handleCategoryToggle={handleCategoryToggle(form, this.props.handleChange)}
          handleChange={this.props.handleChange}
          handleCallTypeButtonClick={this.props.handleCallTypeButtonClick}
          handleSubmit={this.props.handleSubmit(form, this.props.handleCompleteTask)}
          handleFocus={this.props.handleFocus}
          handleSelectSearchResult={this.props.handleSelectSearchResult}
          changeTab={this.props.changeTab}
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
  handleSubmit: handleSubmit(dispatch),
  handleSelectSearchResult: bindActionCreators(handleSelectSearchResult, dispatch),
  recreateSearchContact: bindActionCreators(recreateSearchContact, dispatch),
  changeTab: bindActionCreators(Actions.changeTab, dispatch),
});

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(TaskView));
