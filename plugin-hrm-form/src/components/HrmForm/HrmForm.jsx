import React from 'react';

import { HrmFormComponentStyles } from './HrmForm.Styles';

// It is recommended to keep components stateless and use redux for managing states
// ^^ I'm totally breaking this just to get a working form going.  TODO(nick): don't break this
class HrmForm extends React.Component {
  handleClick(e) {
    fetch('http://localhost:8080/', {  
      method: 'GET',
      //mode: 'no-cors', // TODO(nick): don't do this in production
      headers: { 'Content-Type': 'application/json' }
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
