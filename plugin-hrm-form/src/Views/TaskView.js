import React, { Component } from "react";
import { withTaskContext } from "@twilio/flex-ui";
import HrmForm from './Forms/HrmForm';

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
          <HrmForm 
            form={this.props.form} 
            handleChange={this.props.handleChange}
            handleCallTypeButtonClick={this.props.handleCallTypeButtonClick}/>
      </div>
    );
  }
}

export default withTaskContext(TaskView);