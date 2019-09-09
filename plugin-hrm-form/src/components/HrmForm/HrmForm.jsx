import React from 'react';

import { HrmFormComponentStyles } from './HrmForm.Styles';

// It is recommended to keep components stateless and use redux for managing states
// ^^ I'm totally breaking this just to get a working form going.  TODO(nick): don't break this
class HrmForm extends React.Component {
  handleClick(e) {
    const data = {
      taskId: 'TA123',
      reservationId: 'TR123',
      ageBracket: '13-15',
      subcategory: 'Gang violence',
      timestamp: 1568065107000
    };
    fetch('http://localhost:8080/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      console.log(JSON.stringify(myJson));
    })
    .catch(function(response) {
      alert("Failed!");
    });
  }

  render() {
    if (!this.props.isOpen) {
      return null;
    }

    return (
      <HrmFormComponentStyles>
        This is a dismissible demo component
        <i className="accented" onClick={this.props.dismissBar}>
          close
        </i>
        <button onClick={this.handleClick}>
          send data
        </button>
      </HrmFormComponentStyles>
    );
  }
}

export default HrmForm;
