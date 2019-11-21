import React from 'react';
import { RecentContactsComponentStyles, RecentContactsContactViewStyles } from './RecentContacts.Styles';

export default class RecentContactsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myJson: "no data yet!",
      id: undefined,
      lastLoad: undefined
    };
  }

  loadJson() {
    // Don't reload data more than every 5 seconds
    if (this.state.lastLoad && Date.now() - this.state.lastLoad < 5000) return;

    const self = this;
    var url = 'https://hrm.tl.barbarianrobot.com';
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
      self.setState({
          myJson: myJson,
          lastLoad: Date.now()
        });
    })
    .catch(function(response) {
      self.setState({
        myJson: "Failed!: " + response,
        lastLoad: Date.now()
      });
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
    var str = [val.firstName, val.lastName].filter(e => e).join(' ');
    if (str.length > 25) str = str.slice(0,22) + "...";
    return str ? str : "n/a";
  }

  yesOrNo(val) {
    if (val === undefined) return "n/a";
    return val ? 'Yes' : 'No';
  }

  listCategories(form) {
    if (!form || !form.caseInformation || !form.caseInformation.categories) return "n/a";
    const categories = form.caseInformation.categories;
    const categoryArray = Object.keys(categories).reduce((acc, key) => {
      return acc.concat(Object.keys(categories[key]).filter(e => categories[key][e]).map(e => this.capitize(key) + ': ' + this.capitize(e)))
    }, []);
    if (categoryArray.length === 0) return "n/a";
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

  // yes, it's a stupid name.  Turns 'category1' into 'Category 1' and 'sub3' into 'Subcategory 3'
  capitize(str) {
    var spaced = str.replace(/sub/, "subcategory").replace(/(\d+)/, " $1" );
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  render() {
    // Load new data but don't bother if we just selected a detail page
    if (!this.state.id) this.loadJson();

    const myJson = this.state.myJson;
    if (!Array.isArray(myJson)) return '';
    if (this.state.id) {
      const contact = myJson.find(c => c.id === this.state.id);
      if (!contact) {
        this.setState({id: undefined});
      }
      return (
        <RecentContactsContactViewStyles>
          <h1>Contact {contact.id}</h1>
          <p style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={(e) => this.setState({id: undefined})}>Return to list</p>

          { !contact.FormData ?
            <p>Contact has no data</p> :
            <section>
              <table>
                <tbody>
                  <tr>
                    <th>Time</th>
                    <td>{this.formatDate(contact.Date)}</td>
                  </tr>
                  <tr>
                    <th>Channel</th>
                    <td>{this.valueOrNone(contact.FormData.channel)}</td>
                  </tr>
                  <tr>
                    <th>Number</th>
                    <td>{this.valueOrNone(contact.FormData.number)}</td>
                  </tr>
                  <tr>
                    <th>Call type</th>
                    <td>{this.valueOrNone(contact.FormData.callType)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          }

          { /* TODO(nick): Use DomainConstaints for this check after integrating the plugins */ }
          { !contact.FormData || contact.FormData.callType !== 'Someone calling about a child' ? '' :
            <section>
              <h2>Caller Information</h2>
              <table>
                <tbody>
                  <tr>
                    <th>First Name</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.name.firstName)}</td>
                  </tr>
                  <tr>
                    <th>Last Name</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.name.lastName)}</td>
                  </tr>
                  <tr>
                    <th>Relationship to Child</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.relationshipToChild)}</td>
                  </tr>
                  <tr>
                    <th>Gender</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.gender)}</td>
                  </tr>
                  <tr>
                    <th>Age</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.age)}</td>
                  </tr>
                  <tr>
                    <th>Language</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.language)}</td>
                  </tr>
                  <tr>
                    <th>Nationality</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.nationality)}</td>
                  </tr>
                  <tr>
                    <th>Ethnicity</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.ethnicity)}</td>
                  </tr>
                  <tr>
                    <th>Street</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.location.streetAddress)}</td>
                  </tr>
                  <tr>
                    <th>City</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.location.city)}</td>
                  </tr>
                  <tr>
                    <th>State</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.location.stateOrCounty)}</td>
                  </tr>
                  <tr>
                    <th>Phone 1</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.location.phone1)}</td>
                  </tr>
                  <tr>
                    <th>Phone 2</th>
                    <td>{this.valueOrNone(contact.FormData.callerInformation.location.phone2)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          }

          { /* TODO(nick): Use DomainConstaints for these checks after integrating the plugins */ }
          { !contact.FormData ||
              (contact.FormData.callType !== 'Someone calling about a child' &&
               contact.FormData.callType !== 'Child calling about self') ? '' :
            <>
              <section>
                <h2>Child Information</h2>
                <table>
                  <tbody>
                    <tr>
                      <th>First Name</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.name.firstName)}</td>
                    </tr>
                    <tr>
                      <th>Last Name</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.name.lastName)}</td>
                    </tr>
                    <tr>
                      <th>Gender</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.gender)}</td>
                    </tr>
                    <tr>
                      <th>Age</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.age)}</td>
                    </tr>
                    <tr>
                      <th>Language</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.language)}</td>
                    </tr>
                    <tr>
                      <th>Nationality</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.nationality)}</td>
                    </tr>
                    <tr>
                      <th>Ethnicity</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.ethnicity)}</td>
                    </tr>
                    <tr>
                      <th>Refugee?</th>
                      <td>{this.yesOrNo(contact.FormData.childInformation.refugee)}</td>
                    </tr>
                    <tr>
                      <th>Disabled/Special Needs?</th>
                      <td>{this.yesOrNo(contact.FormData.childInformation.disabledOrSpecialNeeds)}</td>
                    </tr>
                    <tr>
                      <th>Hiv Positive?</th>
                      <td>{this.yesOrNo(contact.FormData.childInformation.hiv)}</td>
                    </tr>
                    <tr>
                      <th>Street</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.location.streetAddress)}</td>
                    </tr>
                    <tr>
                      <th>City</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.location.city)}</td>
                    </tr>
                    <tr>
                      <th>State</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.location.stateOrCounty)}</td>
                    </tr>
                    <tr>
                      <th>Phone 1</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.location.phone1)}</td>
                    </tr>
                    <tr>
                      <th>Phone 2</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.location.phone2)}</td>
                    </tr>
                    <tr>
                      <th>School Name</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.school.name)}</td>
                    </tr>
                    <tr>
                      <th>Grade Level</th>
                      <td>{this.valueOrNone(contact.FormData.childInformation.school.gradeLevel)}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section>
                <h2>Issue Categorization</h2>
                <table>
                  <tbody>
                    <th>Categories</th>
                    <td>{this.listCategories(contact.FormData)}</td>
                  </tbody>
                </table>
              </section>

              <section>
                <h2>Case Information</h2>
                <table>
                  <tbody>
                    <tr>
                      <th>Notes</th>
                      <td>{this.valueOrNone(contact.FormData.caseInformation.callSummary).split("\n")
                            .map(para => (
                              <>
                                {para}
                                <br />
                              </>
                            ))}</td>
                    </tr>
                    <tr>
                      <th>Referred to</th>
                      <td>{this.valueOrNone(contact.FormData.caseInformation.referredTo)}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>{this.valueOrNone(contact.FormData.caseInformation.status)}</td>
                    </tr>
                    <tr>
                      <th>How did the child hear about us?</th>
                      <td>{this.valueOrNone(contact.FormData.caseInformation.howDidTheChildHearAboutUs)}</td>
                    </tr>
                    <tr>
                      <th>Keep Confidential?</th>
                      <td>{this.yesOrNo(contact.FormData.caseInformation.keepConfidential)}</td>
                    </tr>
                    <tr>
                      <th>OK for case worker to call?</th>
                      <td>{this.yesOrNo(contact.FormData.caseInformation.okForCaseWorkerToCall)}</td>
                    </tr>
                    <tr>
                      <th>Did you discuss rights with the child?</th>
                      <td>{this.yesOrNo(contact.FormData.caseInformation.didYouDiscussRightsWithTheChild)}</td>
                    </tr>
                    <tr>
                      <th>Did the child feel we solved their problem?</th>
                      <td>{this.yesOrNo(contact.FormData.caseInformation.didTheChildFeelWeSolvedTheirProblem)}</td>
                    </tr>
                    <tr>
                      <th>Would the child recommend us to a friend?</th>
                      <td>{this.yesOrNo(contact.FormData.caseInformation.wouldTheChildRecommendUsToAFriend)}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </>
          }
        </RecentContactsContactViewStyles>
      );
    }
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
                    <td style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={(e) => this.setState({id: element.id})}>{this.valueOrNone(element.id)}</td>
                    <td>{this.valueOrNone(element.FormData && element.FormData.channel)}</td>
                    <td>{this.valueOrNone(element.FormData && element.FormData.number)}</td>
                    <td>{this.valueOrNone(element.FormData && element.FormData.callType)}</td>
                    <td>{this.nameFor(element.FormData && element.FormData.callerInformation && element.FormData.callerInformation.name)}</td>
                    <td>{this.nameFor(element.FormData && element.FormData.childInformation && element.FormData.childInformation.name)}</td>
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
