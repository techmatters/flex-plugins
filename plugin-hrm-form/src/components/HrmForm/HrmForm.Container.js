import React from 'react'
import HrmForm from './HrmForm'

class HrmFormContainer extends React.Component {
  submit = values => {
    let formdata = {
      ...values,
      timestamp: 0,
      taskId: this.props.task.taskSid,
      reservationId: this.props.task.sid
    };
    // print the form values to the console
    console.log(formdata);
    fetch('http://localhost:8080/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formdata)
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      console.log(JSON.stringify(myJson));
    })
    .catch(function(response) {
      alert("Failed!: " + response);
    });
  }

  render() {
    if (!this.props.task) {
      return <p>No active tasks</p>;
    }
    return <HrmForm onSubmit={this.submit} />
  }
}

export default HrmFormContainer;
