import React from 'react';
import { RecentContactsComponentStyles } from './RecentContacts.Styles';

export default class RecentContactsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myJson: "no data yet!"
    };
  }

  componentWillMount() {
    const self = this;
    const url = 'https://hrm.tl.barbarianrobot.com';
    // var url = 'http://localhost:8080';
    url += '/contacts';
    if (this.props.helpline) {
      url += "?queueName=" + encodeURIComponent(this.props.helpline);
    }
    fetch(url, {
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

  formatDate(val) {
    if (!val) return "n/a";
    var d = new Date(val);
    return d.toLocaleString();
  }

  valueOrNone(val) {
    return val ? val : "n/a";
  }

  nameFor(val) {
    if (!val) return "n/a";
    const str = [val.firstName, val.lastName].filter(e => e).join(' ');
    return str ? str : "n/a";
  }

  listCategories(form) {
    if (!form || !form.caseInformation || !form.caseInformation.categories) return "n/a";
    const categories = form.caseInformation.categories;
    const categoryArray = Object.keys(categories).reduce((acc, key) => {
      return acc.concat(Object.keys(categories[key]).filter(e => categories[key][e]).map(e => this.capitize(key) + ': ' + this.capitize(e)))
    }, []);
    console.log(categoryArray);
    return (
      <>
        { categoryArray.map(e => {
            return (
              <>
                {e}<br />
              </>
            );
          })
        }
      </>
    );
  }

  // yes, it's a stupid name.  Turns 'category1' into 'Category 1' and 'sub3' into 'Sub 3'
  capitize(str) {
    var spaced = str.replace(/(\d+)/, " $1" );
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  render() {
    const myJson = this.state.myJson;
    if (!Array.isArray(myJson)) return '';
    return (
      <RecentContactsComponentStyles>
          <h1>Latest contacts for {this.props.helpline ? this.props.helpline : "all helplines"}</h1>

          <table>
            <tbody>
              <tr>
                <th>Time</th>
                <th>Contact Id</th>
                <th>Channel</th>
                <th>Number</th>
                <th>Call type</th>
                <th>Caller name</th>
                <th>Child name</th>
                <th>Categories</th>
              </tr>
              {myJson.map((element) => {
                return (
                  <tr>
                    <td>{this.formatDate(element.Date)}</td>
                    <td>{this.valueOrNone(element.id)}</td>
                    <td>{this.valueOrNone(element.FormData && element.FormData.channel)}</td>
                    <td>{this.valueOrNone(element.FormData && element.FormData.number)}</td>
                    <td>{this.valueOrNone(element.FormData && element.FormData.callType)}</td>
                    <td>{this.nameFor(element.FormData && element.FormData.callerInformation && element.FormData.callerInformation.name)}</td>
                    <td>{this.nameFor(element.FormData && element.FormData.childInformation && element.FormData.callerInformation.name)}</td>
                    <td>{this.listCategories(element.FormData)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </RecentContactsComponentStyles>
    );
  }
}
