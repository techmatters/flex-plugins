import React from "react";
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

const NoTaskView = (props) => {
    let { task } = props;

    let show = task && task.taskSid ? "hidden" : "visible";

    return (
        <div
            style={{ ...wrapperStyle, visibility: show }}>
            No Task Selected
        </div>
    )
}

export default withTaskContext(NoTaskView);