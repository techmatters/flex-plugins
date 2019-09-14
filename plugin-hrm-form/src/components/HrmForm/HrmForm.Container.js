import React from 'react'
import HrmForm from './HrmForm'

class HrmFormContainer extends React.Component {
  submit = values => {
    let formdata = {
      ...values,
      ageBracket: '13-15',
      timestamp: 0,
      taskId: 'TA123',
      reservationId: 'TR123'
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
    return <HrmForm onSubmit={this.submit} />
  }
}

export default HrmFormContainer;