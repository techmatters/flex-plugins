import React, { Component } from "react";
import { withTaskContext } from "@twilio/flex-ui";

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

class NoTaskView extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		let { task } = this.props;

		let show = task && task.taskSid ? "hidden" : "visible";

		return (
			<div
				style={{ ...wrapperStyle, visibility: show }}>
				No Task Selected
			</div>)

	}
}

export default withTaskContext(NoTaskView);
