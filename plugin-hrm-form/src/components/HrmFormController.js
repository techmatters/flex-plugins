import React from 'react';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import TaskView from '../Views/TaskView';
import { withTaskContext } from "@twilio/flex-ui";

// import { Actions } from '../../states/CustomTaskListState';

const HrmFormController = (props) => {
  // I don't think this should be needed, since we shouldn't be here
  // if there's no task.  But without this check, props.task.taskSid
  // will error when the task is completed, so there may be a lifecycle issue.
  if (!props.task) {
    return null;
  }

  return (
    <TaskView thisTask={props.thisTask} key={props.task.taskSid} />
  );
}

const mapStateToProps = (state, ownProps) => {
  if (state['hrmform'] && ownProps && ownProps.thisTask) {
    return {
      form: state['hrmform'][ownProps.thisTask]
    };
  } else {
    return null;
  }
};

const mapDispatchToProps = (dispatch) => ({
  // handleChange: bindActionCreators(Actions.handleChange, dispatch)
});

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(HrmFormController));
