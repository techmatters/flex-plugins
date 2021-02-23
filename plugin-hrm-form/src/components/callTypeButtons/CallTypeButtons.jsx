import React from 'react';
import PropTypes from 'prop-types';
import { TaskHelper, Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState, namespace, contactFormsBase, connectedCaseBase } from '../../states';
import { updateCallType } from '../../states/contacts/actions';
import { changeRoute } from '../../states/routing/actions';
import { withLocalization } from '../../contexts/LocalizationContext';
import { Box, Flex } from '../../styles/HrmStyles';
import { Container, Label, DataCallTypeButton, NonDataCallTypeButton } from '../../styles/callTypeButtons';
import callTypes from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/ValidationRules';
import { formType, taskType, localizationType } from '../../types';
import NonDataCallTypeDialog from './NonDataCallTypeDialog';
import { hasTaskControl } from '../../utils/transfer';
import { getConfig } from '../../HrmFormPlugin';
import { submitContactForm, completeTask } from '../../services/formSumbissionHelpers';
import CallTypeIcon from '../common/icons/CallTypeIcon';
import { CustomITask, isOfflineContactTask } from '../../types/types';

const isDialogOpen = contactForm =>
  Boolean(contactForm && contactForm.callType && contactForm.callType && isNonDataCallType(contactForm.callType));

const clearCallType = props => props.dispatch(updateCallType(props.task.taskSid, ''));

/**
 * @type {React.FC<{ task: CustomITask } & ConnectedProps<typeof connector>>}
 */
const CallTypeButtons = props => {
  const { contactForm, caseForm, task, localization } = props;
  const { isCallTask } = localization;

  const handleClick = (taskSid, callType) => {
    if (!hasTaskControl(task)) return;

    props.dispatch(updateCallType(taskSid, callType));
  };

  const handleClickAndRedirect = (taskSid, callType) => {
    if (!hasTaskControl(task)) return;

    // eslint-disable-next-line no-nested-ternary
    const subroute = isOfflineContactTask(task)
      ? 'contactlessTask'
      : callType === callTypes.caller
      ? 'callerInformation'
      : 'childInformation';

    handleClick(taskSid, callType);
    props.dispatch(changeRoute({ route: 'tabbed-forms', subroute }, taskSid));
  };

  const handleNonDataClick = (taskSid, callType) => {
    if (isOfflineContactTask(task)) {
      handleClickAndRedirect(taskSid, callType);
    } else {
      handleClick(taskSid, callType);
    }
  };

  const handleConfirmNonDataCallType = async () => {
    if (!hasTaskControl(task)) return;

    try {
      await submitContactForm(task, contactForm, caseForm);
      await completeTask(task);
    } catch (error) {
      const { strings } = getConfig();
      if (!window.confirm(strings['Error-ContinueWithoutRecording'])) {
        await completeTask(task);
      }
    }
  };

  return (
    <>
      <Container>
        <Box marginBottom="29px">
          <Label style={{ width: 'auto' }}>
            <Template code="CallTypeButtons-Categorize" />
          </Label>
          <DataCallTypeButton onClick={() => handleClickAndRedirect(task.taskSid, callTypes.child)}>
            <Flex width="50px" marginRight="5px">
              <CallTypeIcon callType={callTypes.child} />
            </Flex>
            <Template code="CallType-child" />
          </DataCallTypeButton>
          <DataCallTypeButton onClick={() => handleClickAndRedirect(task.taskSid, callTypes.caller)}>
            <Flex width="50px" marginRight="5px">
              <CallTypeIcon callType={callTypes.caller} />
            </Flex>
            <Template code="CallType-caller" />
          </DataCallTypeButton>
        </Box>

        <Box>
          <Label style={{ width: 'auto' }}>
            <Template code="CallTypeButtons-Or" />
          </Label>
          {Object.keys(callTypes)
            .filter(callType => isNonDataCallType(callTypes[callType]))
            .map((callType, i) => (
              <NonDataCallTypeButton
                key={callType}
                onClick={() => handleNonDataClick(task.taskSid, callTypes[callType])}
                marginRight={i % 2 === 0}
              >
                <Template code={`CallType-${callType}`} />
              </NonDataCallTypeButton>
            ))}
        </Box>
      </Container>
      <NonDataCallTypeDialog
        isOpen={isDialogOpen(contactForm)}
        isCallTask={isCallTask(task)}
        isInWrapupMode={TaskHelper.isInWrapupMode(task)}
        handleConfirm={handleConfirmNonDataCallType}
        handleCancel={() => clearCallType(props)}
      />
    </>
  );
};

CallTypeButtons.displayName = 'CallTypeButtons';
CallTypeButtons.propTypes = {
  contactForm: formType.isRequired,
  caseForm: PropTypes.shape({}).isRequired,
  task: taskType.isRequired,
  localization: localizationType.isRequired,
  dispatch: PropTypes.func.isRequired,
};

/**
 * @param {RootState} state
 */
const mapStateToProps = (state, ownProps) => {
  const contactForm = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const caseState = state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid];
  const caseForm = (caseState && caseState.connectedCase) || {};
  return { contactForm, caseForm };
};

const connector = connect(mapStateToProps);
const connected = connector(CallTypeButtons);

export default withLocalization(connected);
