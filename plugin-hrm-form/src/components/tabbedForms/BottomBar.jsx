import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';
import FolderIcon from '@material-ui/icons/FolderOpen';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { Menu, MenuItem } from '../menu';
import { formIsValid } from '../../states/ValidationRules';
import { formType, taskType } from '../../types';
import { BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { Actions } from '../../states/ContactState';
import { getConfig } from '../../HrmFormPlugin';
import { createCase } from '../../services/CaseService';
import { saveToHrm } from '../../services/ContactService';
import { fillEndMillis } from '../../utils/conversationDuration';

class BottomBar extends Component {
  static displayName = 'BottomBar';

  static propTypes = {
    tabs: PropTypes.number.isRequired,
    form: formType.isRequired,
    changeTab: PropTypes.func.isRequired,
    handleCompleteTask: PropTypes.func.isRequired,
    task: taskType.isRequired,
    changeRoute: PropTypes.func.isRequired,
    handleValidateForm: PropTypes.func.isRequired,
    setConnectedCase: PropTypes.func.isRequired,
  };

  state = {
    anchorEl: null,
    isMenuOpen: false,
    mockedMessage: null,
  };

  toggleCaseMenu = e => {
    e.persist();
    this.setState(prevState => ({ anchorEl: e.currentTarget || e.target, isMenuOpen: !prevState.isMenuOpen }));
  };

  handleMockedMessage = () => this.setState({ mockedMessage: 'Not implemented yet!', isMenuOpen: false });

  closeMockedMessage = () => this.setState({ mockedMessage: null });

  handleOpenNewCase = async () => {
    const { task } = this.props;
    const { taskSid } = task;
    const { hrmBaseUrl, workerSid, helpline } = getConfig();

    const caseRecord = {
      helpline,
      status: 'open',
      twilioWorkerId: workerSid,
    };

    this.setState({ isMenuOpen: false });

    const newForm = this.props.handleValidateForm();

    if (formIsValid(newForm)) {
      try {
        const caseFromDB = await createCase(hrmBaseUrl, caseRecord);
        this.props.changeRoute('new-case', taskSid);
        this.props.setConnectedCase(caseFromDB, taskSid);
      } catch (error) {
        window.alert('Error from backend system.');
      }
    } else {
      window.alert('There is a problem with your submission.  Please check the form for errors.');
    }
  };

  handleNext = () => {
    const { task, form } = this.props;
    const { tab } = form.metadata;
    this.props.changeTab(tab + 1, task.taskSid);
  };

  handleSubmit = async () => {
    const { task } = this.props;
    const { hrmBaseUrl, workerSid, helpline } = getConfig();

    const newForm = this.props.handleValidateForm();

    if (formIsValid(newForm)) {
      try {
        const formWithEndMillis = fillEndMillis(newForm);
        await saveToHrm(task, formWithEndMillis, hrmBaseUrl, workerSid, helpline);
        this.props.handleCompleteTask(task.taskSid, task);
      } catch (error) {
        if (!window.confirm('Error from backend system.  Are you sure you want to end the task without recording?')) {
          this.props.handleCompleteTask(task.taskSid, task);
        }
      }
    } else {
      window.alert('There is a problem with your submission.  Please check the form for errors.');
    }
  };

  render() {
    const { tabs, form } = this.props;
    const { isMenuOpen, anchorEl, mockedMessage } = this.state;

    const { tab } = form.metadata;
    const showNextButton = tab !== 0 && tab < tabs - 1;
    const showSubmitButton = tab === tabs - 1;
    const showBottomBar = showNextButton || showSubmitButton;
    const isSubmitButtonDisabled = !formIsValid(form);
    const isMockedMessageOpen = Boolean(mockedMessage);
    const { featureFlags } = getConfig();

    if (!showBottomBar) return null;

    return (
      <>
        <Dialog onClose={this.closeMockedMessage} open={isMockedMessageOpen}>
          <DialogContent>{mockedMessage}</DialogContent>
        </Dialog>
        <Menu anchorEl={anchorEl} open={isMenuOpen} onClickAway={() => this.setState({ isMenuOpen: false })}>
          <MenuItem Icon={FolderIcon} text="Open New Case" onClick={this.handleOpenNewCase} />
          <MenuItem Icon={AddIcon} text="Add to Existing Case" onClick={this.handleMockedMessage} />
        </Menu>
        <BottomButtonBar>
          {showNextButton && (
            <StyledNextStepButton roundCorners={true} onClick={this.handleNext}>
              Next
            </StyledNextStepButton>
          )}
          {showSubmitButton && (
            <>
              {featureFlags.enable_case_management && (
                <StyledNextStepButton
                  roundCorners={true}
                  onClick={this.toggleCaseMenu}
                  disabled={isSubmitButtonDisabled}
                >
                  Save and Add to Case...
                </StyledNextStepButton>
              )}
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
  setConnectedCase: bindActionCreators(Actions.setConnectedCase, dispatch),
});

export default withTaskContext(connect(null, mapDispatchToProps)(BottomBar));
