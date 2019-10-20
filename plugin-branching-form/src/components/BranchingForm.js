import React from 'react';

const header = {
  backgroundColor: "rgb(79, 94, 122)",
  color: "#FFFFFF",
  display: "block"
}

const paddedDiv = {
  marginTop: 5
}

const col1 = {
  width: 150,
  display: "inline-block"
}

const col2 = {
  width: 300,
  display: "inline-block"
}

const bigcol1 = {
  width: 250,
  marginRight: 10,
  display: "inline-block"
}

const bigcol2 = {
  width: 250,
  display: "inline-block"
}

const subcol1 = {
  width: 100,
  display: "inline-block"
}

const subcol2 = {
  width: "50%",
  display: "inline-block"
}

const spacyField = {
  marginLeft: 10
}

const category = {
  padding: 5 
}

function BranchingFormCallType(props, state) {
  return (
    <div style={paddedDiv}>
      <span style={header}>
        Call Type
      </span>
      <div style={paddedDiv}>
        <label>
          <input type="radio" name="calltype" value="child"
            checked={props.calltype==="child"} onChange={props.onChange} />
          Child calling about self
        </label>
      </div>
      <div style={paddedDiv}>
        <label>
          <input type="radio" name="calltype" value="caller"
            checked={props.calltype==="caller"} onChange={props.onChange} />
          Someone calling about a child
        </label>
      </div>
      <div style={paddedDiv}>
        <label>
          <input type="radio" name="calltype" value="silent"
            checked={props.calltype==="silent"} onChange={props.onChange} />
          Silent
        </label>
      </div>
      <div style={paddedDiv}>
        <label>
          <input type="radio" name="calltype" value="blank"
            checked={props.calltype==="blank"} onChange={props.onChange} />
          Blank
        </label>
      </div>
      <div style={paddedDiv}>
        <label>
          <input type="radio" name="calltype" value="joke"
             checked={props.calltype==="joke"} onChange={props.onChange} />
          Joke
        </label>
      </div>
      <div style={paddedDiv}>
        <label>
          <input type="radio" name="calltype" value="hangup"
            checked={props.calltype==="hangup"} onChange={props.onChange} />
          Hang Up
        </label>
      </div>
      <div style={paddedDiv}>
        <label>
          <input type="radio" name="calltype" value="wrongnumber"
            checked={props.calltype==="wrongnumber"} onChange={props.onChange} />
          Wrong Number
        </label>
      </div>
      <div style={paddedDiv}>
        <label>
          <input type="radio" name="calltype" value="abusive"
            checked={props.calltype==="abusive"} onChange={props.onChange} />
          Abusive
        </label>
      </div>
    </div>
  );
}

function BranchingFormFirstLastName(props, state) {
  return (
    <>
      <div style={paddedDiv}>
        <span>
          <label style={col1}>
            First name
          </label>
          <input type="text" name={props.first}
            value={props.firstval} onChange={props.onChange} />
        </span>
      </div>
      <div style={paddedDiv}>
        <span> 
          <label style={col1}>
            Last name
          </label>
          <input type="text" name={props.last}
            value={props.lastval} onChange={props.onChange} />
        </span>
      </div>
    </>
  );
}

function BranchingFormYesNoRadioButtons(props, state) {
  return (
    <span style={spacyField}>
      <input type="radio" name={props.name} value="yes"
        checked={props.value==="yes"} onChange={props.onChange} />
      Yes
      <input style={spacyField} type="radio" name={props.name} value="no"
        checked={props.value==="no"} onChange={props.onChange} />
      No
    </span>
  );
}

function BranchingFormRelationshipToChild(props, state) {
  return (
    <div style={paddedDiv}>
      <label>
        Relationship to Child:
      </label>
      <select style={spacyField}>
        <option value="friend">Friend</option>
        <option value="neighbor">Neighbor</option>
        <option value="parent">Parent</option>
        <option value="grandparent">Grandparent</option>
        <option value="teacher">Teacher</option>
        <option value="other">Other</option>
      </select> 
    </div>
  );
}

function BranchingFormGenderAndAge(props, state) {
  return (
    <div style={paddedDiv}>
      <span style={bigcol1}>
        <label style={subcol1}>
          Gender:
        </label>
        <select style={subcol2}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="unknown">Unknown</option>
        </select>
      </span>
      <span style={bigcol2}>
        <label style={subcol1}>
          Age:
        </label>
        <select style={subcol2}>
          <option value="0-3">0-3</option>
          <option value="4-6">4-6</option>
          <option value="7-9">7-9</option>
          <option value="10-12">10-12</option>
          <option value="13-15">13-15</option>
          <option value="16-17">16-17</option>
          <option value="18-25">18-25</option>
        </select>
      </span>
    </div>
  );
}

function BranchingFormLanguageNationalityEthnicity(props, state) {
  return (
    <>
      <div style={paddedDiv}>
        <span style={bigcol1}>
          <label style={subcol1}>
            Language
          </label>
          <select style={subcol2}>
            <option value="language1">Language 1</option>
            <option value="language2">Language 2</option>
            <option value="language3">Language 3</option>
          </select>
        </span>
        <span style={bigcol2}>
          <label style={subcol1}>
            Nationality
          </label>
          <select style={subcol2}>
            <option value="nationality1">Nationality 1</option>
            <option value="nationality2">Nationality 2</option>
            <option value="nationality3">Nationality 3</option>
          </select>
        </span>
      </div>
      <div style={paddedDiv}>
        <label>
          Ethnic Background/Race:
        </label>
        <select style={spacyField}>
          <option value="ethnicity1">Ethnicity 1</option>
          <option value="ethnicity2">Ethnicity 2</option>
          <option value="ethnicity3">Ethnicity 3</option>
        </select>    
      </div>
    </>
  );
}

function BranchingFormLocation(props, state) {
  return (
    <>
      <div style={{fontWeight: "bold", marginTop: 10, marginButton: 5}}>
        Location:
      </div>
      <div>
        <label style={col1}>
          Street Address:
        </label>
        <input style={col2} type="text" />
      </div>
      <div>
        <label style={col1}>
          City:
        </label>
        <input style={col2} type="text" />
      </div>
      <div>
        <label style={col1}>
          State/County:
        </label>
       <input style={col2} type="text" />
      </div>
      <div>
        <label style={col1}>
          Postal Code:
        </label>
        <input style={col2} type="text" />
      </div>
      <div>
        <label style={col1}>
          Phone #1:
        </label>
        <input style={col2} type="text" />
      </div>
      <div>
        <label style={col1}>
          Phone #2:
        </label>
        <input style={col2} type="text" />
      </div>
    </>
  );
}

function BranchingFormConfidentiality(props, state) {
  return (
    <>
      <div style={paddedDiv}>
        <label>
          Keep Confidential:
        </label>
        <BranchingFormYesNoRadioButtons
          name="confidential"
          value={props.confidential}
          onChange={props.onChange}
        />
      </div>
      <div style={paddedDiv}>
        <label>
          OK for Case Worker to Call?:
        </label>
        <BranchingFormYesNoRadioButtons
          name="callpermission"
          value={props.callpermission}
          onChange={props.onChange}
        />
      </div>
    </>
  );
}

function BranchingFormSchool(props, state) {
  return (
    <>
      <div style={{fontWeight: "bold", marginTop: 10, marginButton: 5}}>
        School:
      </div>
      <div>
        <label style={col1}>
          Name:
        </label>
        <input style={col2} type="text" />
      </div>
      <div>
        <label style={col1}>
          Grade Level:
        </label>
        <input style={col2} type="text" />
      </div>
    </>
  );
}

function BranchingFormChildSpecialIssues(props, state) {
  return (
    <>
      <div style={paddedDiv}>
        <label>
          Refugee?:
        </label>
        <BranchingFormYesNoRadioButtons
          name="refugee"
          value={props.refugee}
          onChange={props.onChange}
        />
        <label style={spacyField}>
          Disabled/Special Needs?:
        </label>
        <BranchingFormYesNoRadioButtons
          name="specialneeds"
          value={props.specialneeds}
          onChange={props.onChange}
        />
      </div>
      <div style={paddedDiv}>
        <label>
          HIV Positive?:
          <BranchingFormYesNoRadioButtons
            name="hiv"
            value={props.hiv}
            onChange={props.onChange}
          />
        </label>
      </div>
    </>
  );
}

function BranchingFormCallerInformation(props, state) {
  return (
    <div className="section">
      <span style={header}>
        Caller Information
      </span>
      <BranchingFormFirstLastName 
        first="callerfirstname" 
        firstval={props.callerfirstname}
        last="callerlastname"
        lastval={props.callerlastname}
        onChange={props.onChange}
      />
      <BranchingFormRelationshipToChild />
      <BranchingFormGenderAndAge />
      <BranchingFormLanguageNationalityEthnicity />
      <BranchingFormLocation />
      { props.calltype !== 'caller' ? '' : 
        <BranchingFormConfidentiality 
          confidential={props.confidential}
          callpermission={props.callpermission}
          onChange={props.onChange} />
      }
    </div>
  );
}

function BranchingFormChildInformation(props, state) {
  return (
    <div style={paddedDiv}>
      <span style={header}>
        Child Information
      </span>
      <BranchingFormFirstLastName 
        first="childfirstname" 
        firstval={props.childfirstname}
        last="childlastname"
        lastval={props.childlastname}
        onChange={props.onChange}
      />
      <BranchingFormRelationshipToChild />
      <BranchingFormGenderAndAge />
      <BranchingFormLanguageNationalityEthnicity />
      <BranchingFormSchool />
      <BranchingFormLocation />
      { props.calltype !== 'child' ? '' : 
        <BranchingFormConfidentiality 
          confidential={props.confidential}
          callpermission={props.callpermission}
          onChange={props.onChange} />
      }
      <BranchingFormChildSpecialIssues
        refugee={props.refugee}
        specialneeds={props.specialneeds}
        hiv={props.hiv}
      />
    </div>
  );
}

function BranchingFormIssueCategory(props, state) {
  const cat = props.category;
  return (
    <>
      <div style={{fontWeight: 'bold'}}>Category {cat}</div>
      {Array.from(Array(6), (e, i) => {
        const name = `cat${cat}sub${i+1}`;
        return (
          <div style={paddedDiv}>
            <input 
              type="checkbox" 
              name={name}
              value={name}
            />
            Sub{i+1}
          </div>
        );
      })}
    </>
  );
}

function BranchingFormIssueCategorization(props, state) {
  return (
    <div style={paddedDiv}>
      <span style={header}>
        Issue Categorization
      </span>
      <table>
        <tbody>
          <tr>
            <td style={category}><BranchingFormIssueCategory category="1"/></td>
            <td style={category}><BranchingFormIssueCategory category="3"/></td>
            <td style={category}><BranchingFormIssueCategory category="5"/></td>
          </tr>
          <tr>
            <td style={category}><BranchingFormIssueCategory category="2"/></td>
            <td style={category}><BranchingFormIssueCategory category="4"/></td>
            <td style={category}><BranchingFormIssueCategory category="6"/></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function BranchingFormCaseInformation(props, state) {
  return (
    <div style={paddedDiv}>
      <span style={header}>
        Case Information
      </span>
      <div style={paddedDiv}>
        <label>
          <span style={{verticalAlign: "top"}}>Call Summary:</span>
          <textarea rows={20} cols={80}/>
        </label>
      </div>
      <div style={paddedDiv}>
        <label>
          Referred to:
        </label>
        <select style={spacyField}>
          <option value="noreferral">No Referral</option>
          <option value="referral1">Referral 1</option>
          <option value="referral2">Referral 2</option>
          <option value="referral3">Referral 3</option>
        </select>
      </div>
      <div style={paddedDiv}>
        <label>
          Status:
        </label>
        <input style={spacyField} type="radio" name="status" value="open"
          checked={props.status==="open"} onChange={props.onChange} />
        Open
        <input style={spacyField} type="radio" name="status" value="closed"
          checked={props.status==="closed"} onChange={props.onChange} />
        Closed
        <input style={spacyField} type="radio" name="status" value="inprogress"
          checked={props.status==="inprogress"} onChange={props.onChange} />
        In Progress
      </div>
    </div>
  );
}

function BranchingFormSummary(props, state) {
  return (
    <>
      <div style={paddedDiv}>
        <label>
          Did you discuss rights with the child:
        </label>
        <BranchingFormYesNoRadioButtons
          name="discussrights"
          value={props.discussrights}
          onChange={props.onChange}
        />
      </div>
      <div style={paddedDiv}>
        <label>
          Did the child feel we solved their problem:
        </label>
        <BranchingFormYesNoRadioButtons
          name="solvedproblem"
          value={props.solvedproblem}
          onChange={props.onChange}
        />
      </div>
      <div style={paddedDiv}>
        <label>
          Would the child recommend us to a friend:
        </label>
        <BranchingFormYesNoRadioButtons
          name="recommend"
          value={props.recommend}
          onChange={props.onChange}
        />
      </div>
      <div style={paddedDiv}>
        <label>
          How did the child hear about us:
        </label>
        <select style={spacyField}>
          <option value="wordofmouth">Word of mouth</option>
          <option value="media">Media</option>
          <option value="friend">Friend</option>
          <option value="school">School</option>
        </select>
      </div>
    </>
  );
}

class BranchingForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'calltype': '',
      'callerfirstname': '',
      'callerlastname': '',
      'childfirstname': '',
      'childlastname': '',
      'confidential': 'yes',
      'callpermission': 'yes',
      'refugee': 'no',
      'specialneeds': '',
      'hiv': '',
      'status': '',
      'discussrights': '',
      'solvedproblem': '',
      'recommend': ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    alert('Submit not working right now, this is a demo!');
    event.preventDefault();
  }

  render() {
    const calltype = this.state.calltype;
    return (
      <form onSubmit={this.handleSubmit}>
        <BranchingFormCallType calltype={this.state.calltype} onChange={this.handleChange} />
        {calltype !== 'caller' ? '' :
          <BranchingFormCallerInformation 
            callerfirstname={this.state.callerfirstname} 
            callerlastname={this.state.callerlastname}
            confidential={this.state.confidential}
            callpermission={this.state.callpermission}
            calltype={calltype}
            onChange={this.handleChange} />
        }
        {(calltype !== 'caller' && calltype !== 'child') ? '' : 
          <BranchingFormChildInformation 
            childfirstname={this.state.childfirstname} 
            childlastname={this.state.childlastname}
            confidential={this.state.confidential}
            callpermission={this.state.callpermission}
            refugee={this.state.refugee}
            specialneeds={this.state.specialneeds}
            hiv={this.state.hiv}
            calltype={calltype}
            onChange={this.handleChange} />
        }
        {(calltype !== 'caller' && calltype !== 'child') ? '' : 
          <>
            <BranchingFormIssueCategorization />
            <BranchingFormCaseInformation 
              status={this.state.status} 
              onChange={this.handleChange}
            />
            <BranchingFormSummary
              discussrights={this.state.discussrights}
              solvedproblem={this.state.solvedproblem}
              recommend={this.state.recommend}
              onChange={this.handleChange}
            />
          </>
        }
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default BranchingForm;
