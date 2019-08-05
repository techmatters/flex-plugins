import React from 'react';
import { Global, css } from '@emotion/core';

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
  	this.state = { isDataSubmitted: false };
  	this.handleClick = this.handleClick.bind(this);
  	this.flexInstance = props.flexInstance;
  }

  handleClick() {
  	this.setState(
  		state => ({
  		  isDataSubmitted: !state.isDataSubmitted
  	    }), 
  	    () => {
  		  if (this.state.isDataSubmitted) {
  		    this.flexInstance.Actions.invokeAction("submitData");
  		  }
  	    }
  	);

  	this.flexInstance.Actions.invokeAction("CompleteTask", {sid: this.props.task.sid});
  }

  render() {
  	const display = (this.props.task && this.props.task.status === 'wrapping') ? 'none' : 'visible';
  	return (
      <>
      <Global
        styles={{
          '.Twilio-TaskCanvasHeader-EndButton': { 
          	display }
        }}
      ></Global>
      {this.getEndTaskButton()}
      </>
  	);
  }

  getEndTaskButton() {
  	if (this.props.task && this.props.task.status === 'wrapping') {
  	  return (
	    <div style={taskListStyles}>
	      <button onClick={this.handleClick}>
	        {this.state.isDataSubmitted ? 'YES' : 'NO'}
	      </button>
	    </div>
	  );
  	}
  	return (<div>Waiting...</div>);
  }
};

export default ContactDataSubmissionComponent;
