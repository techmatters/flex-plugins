import React from 'react'
import HrmForm from './HrmForm'
import { SubmissionError } from 'redux-form'


const makeErrorString = errors => {
  var myString = "Cannot complete task due to errors: \n";
  Object.keys(errors).forEach( key => {
    myString += "- " + key + ": " + errors[key] + "\n";
  });
  return myString;
}

class HrmFormContainer extends React.Component {
  submit = values => {
    const url = 'https://hrm.tl.barbarianrobot.com';
    // const url = 'http://localhost:8080';
    const errors = {};
    if (!values.ageBracket) {
      errors.ageBracket = 'Age bracket is required';
    }
    if (!values.subcategory) {
      errors.subcategory = 'Subcategory is required';
    }
    if (Object.keys(errors).length !== 0) {
      alert(makeErrorString(errors));
      throw new SubmissionError(errors);
    }
    let formdata = {
      ...values,
      timestamp: 0,
      taskId: this.props.task.taskSid,
      reservationId: this.props.task.sid
    };
    const completeTaskFunc = this.props.onCompleteTask;
    const sid = this.props.task.sid;
    // print the form values to the console
    console.log("Sending: " + JSON.stringify(formdata));
    return fetch(url + '/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formdata)
    })
    .then(function(response) {
      if (!response.ok) {
        console.log("Form error: " + response.statusText);
        throw new SubmissionError({
          _error: 'Unable to save form: ' + response.statusText
        });
      }
      return response.json();
    })
    .then(function(myJson) {
      console.log("Received: " + JSON.stringify(myJson));
      return completeTaskFunc(sid);
    })
    .catch(function(response) {
      console.log("Caught something");
      throw new SubmissionError({
        _error: 'Unable to save data to server'
      });
    });
  }



  render() {
    if (!this.props.task) {
      return <p>No active tasks</p>;
    }
    return (
      <div>
        <HrmForm 
          onSubmit={this.submit}
          form={ this.props.task.taskSid }
        />
        { this.props.task.attributes && this.props.task.attributes.country &&
          <p>Country: { this.props.task.attributes.country }</p>
        }
      </div>
    );
  }
}

export default HrmFormContainer;
