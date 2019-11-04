import React from "react";
import HrmFormController from './HrmFormController';
import NoTaskView from "../Views/NoTaskView";
import { connect } from "react-redux";

const CustomCRMContainer = (props) => {
  let { tasks } = props;

  return (
    <div>
      <NoTaskView key="no-task"/>
      {Array.from(tasks.values()).map(item => (
        <HrmFormController thisTask={item} key={'controller-' + item.taskSid} handleCompleteTask={props.handleCompleteTask} />
      ))}
    </div>
  );
};

const mapStateToProps = state => {
	return {
		tasks: state.flex.worker.tasks
	};
};

export default connect(mapStateToProps)(CustomCRMContainer);