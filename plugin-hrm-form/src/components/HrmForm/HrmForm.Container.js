//import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';

//import { Actions } from '../../states/HrmFormState';
//import HrmForm from './HrmForm';

// const mapStateToProps = (state) => ({
//   subcategory: state['hrm-form'].hrmForm.subcategory,
// });

// const mapDispatchToProps = (dispatch) => ({
//   updateForm: bindActionCreators(Actions.updateForm, dispatch),
// });

// // See https://github.com/reduxjs/react-redux/blob/master/docs/api/connect.md#connect
// // "The connect() function connects a React component to a Redux store."
// export default connect(mapStateToProps, mapDispatchToProps)(HrmForm);

import React from 'react'
import HrmForm from './HrmForm'

class HrmFormContainer extends React.Component {
  submit = values => {
    // print the form values to the console
    console.log(values)
  }
  render() {
    return <HrmForm onSubmit={this.submit} />
  }
}

export default HrmFormContainer;