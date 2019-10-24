import React, { Component } from "react";
import { withTaskContext } from "@twilio/flex-ui";
import BranchingForm from './Forms/Forms'

const wrapperStyle = {
  position: "absolute",
  margin: "0",
  padding: "0",
  border: "0px",
  overflow: "hidden",
  height: "100%",
  width: "100%",
  height: "100%",
};

const frameStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  border: "0px"
};

class TaskView extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    console.log("IFrame unmounted");
  }

  componentDidMount() {
    console.log("IFrame mounted");
  }

  render() {
    let { task, thisTask } = this.props;

    let show = task && task.taskSid === thisTask.taskSid ? "visible" : "hidden";

    // Made up this task attribute to demonstrate
    if (thisTask.attributes.isIframe) {
      return (
        <div style={{ ...wrapperStyle, visibility: show }}>
          <iframe style={frameStyle} src={"http://www.bing.com"} />
        </div>
      )
    }
    else {
      //return <div style={{ ...wrapperStyle, visibility: show }}>Test Task</div>
      return (
        <div style={{ ...wrapperStyle, visibility: show }}>
          <BranchingForm key={thisTask.taskSid} />
        </div>

      )
    }
  }
}

export default withTaskContext(TaskView);
