import React from "react";
import TaskView from "../Views/TaskView";
import NoTaskView from "../Views/NoTaskView";
import { connect } from "react-redux";

const CustomCRMContainer = (props) => {
  let { tasks } = props;

  return (
    <div>
      <NoTaskView key="no-task"></NoTaskView>
      {Array.from(tasks.values()).map(item => (
        <TaskView thisTask={item} key={item.taskSid}></TaskView>
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