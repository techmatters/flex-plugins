import React, { Component } from "react";
import { withTaskContext } from "@twilio/flex-ui";

const wrapperStyle = {
  position: "absolute",
  margin: "0",
  padding: "0",
  border: "0px",
  overflow: "hidden",
  height: "100%",
  width: "100%"
};

class TaskView extends Component {
  componentWillUnmount() {
    console.log("IFrame unmounted");
  }

  componentDidMount() {
    console.log("IFrame mounted");
  }

  render() {
    let { task, thisTask } = this.props;

    // If this task is not the active task, hide it
    let show = task && task.taskSid === thisTask.taskSid ? "visible" : "hidden";

    return (
      <div style={{ ...wrapperStyle, visibility: show }}>
          <h1>Hello!  This is the task view for {thisTask.taskSid}</h1>
      </div>
    );
  }
}

export default withTaskContext(TaskView);