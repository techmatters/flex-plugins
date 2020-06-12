import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';
import FolderIcon from '@material-ui/icons/FolderOpen';
import AddIcon from '@material-ui/icons/Add';

import { Menu, MenuItem } from '../menu';
import { formIsValid } from '../../states/ValidationRules';
import { formType, taskType } from '../../types';
import { BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { Actions } from '../../states/ContactState';

class BottomBar extends Component {
  static displayName = 'BottomBar';

  static propTypes = {
    tabs: PropTypes.number.isRequired,
    form: formType.isRequired,
    changeTab: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    task: taskType.isRequired,
    changeRoute: PropTypes.func.isRequired,
  };

  state = {
    anchorEl: null,
    isMenuOpen: false,
  };

  toggleCaseMenu = e => {
    e.persist();
    this.setState(prevState => ({ anchorEl: e.currentTarget || e.target, isMenuOpen: !prevState.isMenuOpen }));
  };

  handleNext = () => {
    const { task, form } = this.props;
    const { tab } = form.metadata;
    this.props.changeTab(tab + 1, task.taskSid);
  };

  handleSubmit = () => {
    const { task } = this.props;
    this.props.handleSubmit(task);
  };

  render() {
    const { tabs, form, task } = this.props;
    const { isMenuOpen, anchorEl } = this.state;

    const { tab } = form.metadata;
    const showNextButton = tab !== 0 && tab < tabs - 1;
    const showSubmitButton = tab === tabs - 1;
    const isSubmitButtonDisabled = !formIsValid(form);
    const { taskSid } = task;

    return (
      <>
        <Menu anchorEl={anchorEl} open={isMenuOpen} onClickAway={() => this.setState({ isMenuOpen: false })}>
          <MenuItem
            Icon={FolderIcon}
            text="Open New Case"
            onClick={() => this.props.changeRoute('new-case', taskSid)}
          />
          <MenuItem Icon={AddIcon} text="Add to Existing Case" onClick={() => console.log('>> Existing Case 2')} />
        </Menu>
        <BottomButtonBar>
          {showNextButton && (
            <StyledNextStepButton roundCorners={true} onClick={this.handleNext}>
              Next
            </StyledNextStepButton>
          )}
          {showSubmitButton && (
            <>
              <StyledNextStepButton roundCorners={true} onClick={this.toggleCaseMenu}>
                Save and Add to Case...
              </StyledNextStepButton>
              <StyledNextStepButton roundCorners={true} onClick={this.handleSubmit} disabled={isSubmitButtonDisabled}>
                Submit
              </StyledNextStepButton>
            </>
          )}
        </BottomButtonBar>
      </>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  changeRoute: bindActionCreators(Actions.changeRoute, dispatch),
});

export default withTaskContext(connect(null, mapDispatchToProps)(BottomBar));
