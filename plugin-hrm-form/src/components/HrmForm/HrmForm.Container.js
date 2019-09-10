import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Actions } from '../../states/HrmFormState';
import HrmForm from './HrmForm';

const mapStateToProps = (state) => ({
    isOpen: state['hrm-form'].hrmForm.isOpen,
});

const mapDispatchToProps = (dispatch) => ({
  dismissBar: bindActionCreators(Actions.dismissBar, dispatch),
});

// See https://github.com/reduxjs/react-redux/blob/master/docs/api/connect.md#connect
// "The connect() function connects a React component to a Redux store."
export default connect(mapStateToProps, mapDispatchToProps)(HrmForm);
