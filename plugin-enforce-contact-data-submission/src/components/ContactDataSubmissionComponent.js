import React from 'react';

const taskListStyles = {
  padding: '10px',
  margin: '0px',
  color: '#fff',
  background: '#000',
};

//const ContactDataSubmissionComponent = () => {
class ContactDataSubmissionComponent extends React.Component {
  constructor(props) {
  	super(props);
  	// this.state = { isDataSubmitted: false };
  	this.handleClick = this.handleClick.bind(this);
  	// this.flexInstance = props.flexInstance;
  }

  handleClick() {
  	// this.setState(
  	// 	state => ({
  	// 	  isDataSubmitted: !state.isDataSubmitted
  	//     }), 
  	//     () => {
  	// 	  if (this.state.isDataSubmitted) {
  	// 	    this.flexInstance.Actions.invokeAction("submitData");
  	// 	  }
  	//     }
  	// );

  	this.props.onCompleteTask(this.props.task.sid);

  	// this.flexInstance.Actions.invokeAction("CompleteTask", {sid: this.props.task.sid});
  }

  render() {
  	return (
  	  <>
      {this.getEndTaskButton()}
      </>
  	);
  }

  getEndTaskButton() {
  	if (this.props.task && this.props.task.status === 'wrapping') {
  	  return (
	    <div style={taskListStyles}>
	      <button onClick={this.handleClick}>
	      	SUBMIT
	      </button>
	    </div>
	  );
  	}
  	return null;
  }
};

export default ContactDataSubmissionComponent;
