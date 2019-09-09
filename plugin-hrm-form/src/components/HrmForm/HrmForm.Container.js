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

export default connect(mapStateToProps, mapDispatchToProps)(HrmForm);
