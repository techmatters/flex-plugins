import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Actions } from '../../states/CustomTaskListState';
import CustomTaskList from './CustomTaskList';

const mapStateToProps = (state) => ({
    isOpen: state['vanilla-redux'].customTaskList.isOpen,
    form: state['vanilla-redux'].customTaskList.form
});

const mapDispatchToProps = (dispatch) => ({
  dismissBar: bindActionCreators(Actions.dismissBar, dispatch),
  handleChange: bindActionCreators(Actions.handleChange, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomTaskList);
