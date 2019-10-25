import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TaskView from '../Views/TaskView';
import { withTaskContext } from "@twilio/flex-ui";
import { namespace, contactFormsBase } from '../states';


import { Actions } from '../states/ContactState';

const HrmFormController = (props) => {
  // I don't think this should be needed, since we shouldn't be here
  // if there's no task.  But without this check, props.task.taskSid
  // will error when the task is completed, so there may be a lifecycle issue.
  if (!props.task) {
    return null;
  }

  return (
    <TaskView thisTask={props.thisTask} key={props.task.taskSid} form={props.form} handleChange={props.handleChange} />
  );
}

const mapStateToProps = (state, ownProps) => {
  if (!state[namespace][contactFormsBase]['tasks'] ||
        !state[namespace][contactFormsBase]['tasks'][ownProps.thisTask.taskSid]) {
    return {
      form: undefined
    };
  } else {
    return {
      form: state[namespace][contactFormsBase]['tasks'][ownProps.thisTask.taskSid]
    }
  } 
};

const mapDispatchToProps = (dispatch) => ({
  handleChange: bindActionCreators(Actions.handleChange, dispatch)
});

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(HrmFormController));
