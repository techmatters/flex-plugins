import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import { callTypes } from 'hrm-form-definitions';

import { taskType } from '../../types';
import { Box, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { getConfig } from '../../HrmFormPlugin';
import { createCase } from '../../services/CaseService';
import { submitContactForm, completeTask } from '../../services/formSubmissionHelpers';
import { hasTaskControl } from '../../utils/transfer';
import { namespace, contactFormsBase, connectedCaseBase } from '../../states';
import { isNonDataCallType } from '../../states/ValidationRules';
import { recordBackendError, recordingErrorHandler } from '../../fullStory';

class BottomBar extends Component {
  static displayName = 'BottomBar';

  static propTypes = {
    handleSubmitIfValid: PropTypes.func.isRequired,
    optionalButtons: PropTypes.arrayOf(PropTypes.shape({ onClick: PropTypes.func, label: PropTypes.string })),
    showNextButton: PropTypes.bool.isRequired,
    showSubmitButton: PropTypes.bool.isRequired,
    nextTab: PropTypes.func.isRequired,
    task: taskType.isRequired,
    changeRoute: PropTypes.func.isRequired,
    setConnectedCase: PropTypes.func.isRequired,
    contactForm: PropTypes.shape({ callType: PropTypes.oneOf(Object.values(callTypes)) }).isRequired,
  };

  static defaultProps = {
    optionalButtons: undefined,
  };

  state = {
    isSubmitting: false,
  };

  handleOpenNewCase = async () => {
    const { task, contactForm } = this.props;
    const { taskSid } = task;
    const { strings } = getConfig();

    if (!hasTaskControl(task)) return;

    try {
      const caseFromDB = await createCase(task, contactForm);
      this.props.changeRoute({ route: 'new-case' }, taskSid);
      this.props.setConnectedCase(caseFromDB, taskSid, false);
    } catch (error) {
      recordBackendError('Open New Case', error);
      window.alert(strings['Error-Backend']);
    }
  };

  handleSubmit = async () => {
    // eslint-disable-next-line react/prop-types
    const { task, contactForm, caseForm } = this.props;

    if (this.state.isSubmitting || !hasTaskControl(task)) return;

    this.setState({ isSubmitting: true });

    try {
      await submitContactForm(task, contactForm, caseForm);
      await completeTask(task);
    } catch (error) {
      const { strings } = getConfig();
      if (window.confirm(strings['Error-ContinueWithoutRecording'])) {
        await completeTask(task);
      }
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  onError = recordingErrorHandler('Tabbed HRM Form', () => {
    const { strings } = getConfig();
    window.alert(strings['Error-Form']);
  });

  render() {
    const { showNextButton, showSubmitButton, handleSubmitIfValid, optionalButtons, contactForm } = this.props;
    const { isSubmitting } = this.state;

    const showBottomBar = showNextButton || showSubmitButton;
    const { featureFlags } = getConfig();

    if (!showBottomBar) return null;

    return (
      <>
        <BottomButtonBar>
          {optionalButtons &&
            optionalButtons.map((i, index) => (
              <Box key={`optional-button-${index}`} marginRight="15px">
                <StyledNextStepButton type="button" roundCorners secondary onClick={i.onClick} disabled={isSubmitting}>
                  <Template code={i.label} />
                </StyledNextStepButton>
              </Box>
            ))}

          {showNextButton && (
            <StyledNextStepButton type="button" roundCorners={true} onClick={this.props.nextTab}>
              <Template code="BottomBar-Next" />
            </StyledNextStepButton>
          )}
          {showSubmitButton && (
            <>
              {featureFlags.enable_case_management && !isNonDataCallType(contactForm.callType) && (
                <Box marginRight="15px">
                  <StyledNextStepButton
                    type="button"
                    roundCorners
                    secondary
                    onClick={handleSubmitIfValid(this.handleOpenNewCase, this.onError)}
                    data-fs-id="Contact-SaveAndAddToCase-Button"
                    data-testid="BottomBar-SaveAndAddToCase-Button"
                  >
                    <FolderIcon style={{ fontSize: '16px', marginRight: '10px' }} />
                    <Template code="BottomBar-AddContactToNewCase" />
                  </StyledNextStepButton>
                </Box>
              )}
              <StyledNextStepButton
                roundCorners={true}
                onClick={handleSubmitIfValid(this.handleSubmit, this.onError)}
                disabled={isSubmitting}
                data-fs-id="Contact-SaveContact-Button"
                data-testid="BottomBar-SaveContact-Button"
              >
                {isSubmitting ? <CircularProgress size={12} /> : <Template code="BottomBar-SaveCaseContact" />}
              </StyledNextStepButton>
            </>
          )}
        </BottomButtonBar>
      </>
    );
  }
}

/**
 * @param {import('../../states').RootState} state
 */
const mapStateToProps = (state, ownProps) => {
  const contactForm = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const caseState = state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid];
  const caseForm = (caseState && caseState.connectedCase) || {};
  return { contactForm, caseForm };
};

const mapDispatchToProps = dispatch => ({
  changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
  setConnectedCase: bindActionCreators(CaseActions.setConnectedCase, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(BottomBar);
