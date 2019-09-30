import React from 'react'
import HrmForm from './HrmForm'

class HrmFormContainer extends React.Component {
  submit = values => {
    const url = 'https://hrm.tl.barbarianrobot.com';
    // const url = 'http://localhost:8080';
    let formdata = {
      ...values,
      timestamp: 0,
      taskId: this.props.task.taskSid,
      reservationId: this.props.task.sid
    };
    // print the form values to the console
    console.log(formdata);
    fetch(url + '/contacts', {
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
    return (
      <div>
        <HrmForm onSubmit={this.submit} form={ this.props.task.taskSid } />
        { this.props.task.attributes && this.props.task.attributes.country &&
          <p>Country: { this.props.task.attributes.country }</p>
        }
      </div>
    );
  }
}

export default HrmFormContainer;
