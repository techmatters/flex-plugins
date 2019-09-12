import React from 'react';

import { HrmFormComponentStyles } from './HrmForm.Styles';

// It is recommended to keep components stateless and use redux for managing states
// ^^ I'm totally breaking this just to get a working form going.  TODO(nick): don't break this
class HrmForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { formdata: {
      taskId: 'TA123',
      reservationId: 'TR123',
      ageBracket: '13-15',
      subcategory: 'Gang violence',
      timestamp: 1568065107000
    }};
    this.handleClick = this.handleClick.bind(this);
    this.handleSubcategoryChange = this.handleSubcategoryChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleClick(e) {
    fetch('http://localhost:8080/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state.formdata)
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

  handleSubcategoryChange(e) {
    var formdata = this.state.formdata;
    formdata.subcategory = e.target.value;
    this.setState({formdata: formdata});
  }

  handleSubmit(e) {
    fetch('http://localhost:8080/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state.formdata)
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
    e.preventDefault();
  }

  render() {
    if (!this.props.isOpen) {
      return null;
    }

    // refer to https://reactjs.org/docs/forms.html in process
    return (
      <HrmFormComponentStyles>
        This is a dismissible demo component
        <i className="accented" onClick={this.props.dismissBar}>
          close
        </i>
        <form onSubmit={this.handleSubmit}>
          <label>
            Subcategory:
            <input type="text" value={this.state.formdata.subcategory} onChange={this.handleSubcategoryChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        <button onClick={this.handleClick}>
          send data
        </button>
      </HrmFormComponentStyles>
    );
  }
}

export default HrmForm;
