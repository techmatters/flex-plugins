import React from 'react';
import { JsonToTable } from 'react-json-to-table';

export default class RecentContactsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myJson: "no data yet!"
    };
  }

  componentWillMount() {
    const self = this;
    const url = 'http://localhost:8080';
    fetch(url + '/contacts/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      var myString = JSON.stringify(myJson);
      console.log(myString);
      self.setState({myJson: myJson});
    })
    .catch(function(response) {
      self.setState({myJson: "Failed!: " + response});
    });
  }



  render() {
    //const myJson = this.state.myJson;
    const myJson = {
      "Recent Contacts": this.state.myJson
    };
    return (
      <div style={{ overflow: 'auto' }}>
        <JsonToTable json={myJson} />
      </div>
    );
  }
}