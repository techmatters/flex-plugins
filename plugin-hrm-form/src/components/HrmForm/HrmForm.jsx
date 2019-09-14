import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { HrmFormComponentStyles } from './HrmForm.Styles';

// It is recommended to keep components stateless and use redux for managing states
// ^^ I'm totally breaking this just to get a working form going.  TODO(nick): don't break this
// class HrmForm extends React.Component {



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





let HrmForm = props => {
  const { handleSubmit } = props;
  return (
    <HrmFormComponentStyles>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="subcategory">Subcategory</label>
          <Field name="subcategory" component="input" type="text" />
        </div>
        <button type="submit">Submit</button>
      </form>
    </HrmFormComponentStyles>
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
