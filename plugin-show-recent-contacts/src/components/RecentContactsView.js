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
    fetch('http://localhost:8080/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      var myString = JSON.stringify(myJson);
      console.log(myString);
      self.setState({myJson: myJson.reverse()});
    })
    .catch(function(response) {
      self.setState({myJson: "Failed!: " + response});
    });
  }



  render() {
    //const myJson = this.state.myJson;
    const myJson = {
      "Table": this.state.myJson
    };
    return (
      <div style={{ overflow: 'auto' }}>
        <JsonToTable json={myJson} />
      </div>
    );
  }
}