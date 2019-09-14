import React from 'react';

// import { HrmFormComponentStyles } from './HrmForm.Styles';

// // It is recommended to keep components stateless and use redux for managing states
// // ^^ I'm totally breaking this just to get a working form going.  TODO(nick): don't break this
// class HrmForm extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { formdata: {
//       ageBracket: '13-15',
//       subcategory: 'Gang violence',
//       timestamp: 1568065107000
//     }};
//     this.handleSubcategoryChange = this.handleSubcategoryChange.bind(this);
//     this.handleSubmit = this.handleSubmit.bind(this);
//   }

//   handleSubcategoryChange(e) {
//     var formdata = this.state.formdata;
//     formdata.subcategory = e.target.value;
//     this.setState({formdata: formdata});
//   }

//   handleSubmit(e) {
//     var formdata = this.state.formdata;
//     formdata.taskId = this.props.task.taskSid;
//     formdata.reservationId = this.props.task.sid;
//     fetch('http://localhost:8080/contacts', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(this.state.formdata)
//     })
//     .then(function(response) {
//       return response.json();
//     })
//     .then(function(myJson) {
//       console.log(JSON.stringify(myJson));
//     })
//     .catch(function(response) {
//       alert("Failed!: " + response);
//     });
//     e.preventDefault();
//   }

//   render() {
//     if (!this.props.task) {
//       return null;
//     }

//     // refer to https://reactjs.org/docs/forms.html in process
//     return (
//       <HrmFormComponentStyles>
//         <form onSubmit={this.handleSubmit}>
//           <label>
//             Subcategory:
//             <input type="text" value={this.props.subcategory} onChange={this.props.updateForm} />
//           </label>
//           <input type="submit" value="Submit" />
//         </form>
//         <p>task id: { this.props.task.taskSid }</p>
//         <p>reservation id: { this.props.task.sid }</p>
//       </HrmFormComponentStyles>
//     );
//   }
// }

// export default HrmForm;


import { Field, reduxForm } from 'redux-form';

let HrmForm = props => {
  const { handleSubmit } = props;
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="subcategory">Subcategory</label>
        <Field name="subcategory" component="input" type="text" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

const getFormState = state => {
  return state.hrmform.form;
}

HrmForm = reduxForm({
  form: "hrm",
  getFormState: getFormState
})(HrmForm);

export default HrmForm;
