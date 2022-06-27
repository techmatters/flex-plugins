/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/prop-types */
import React from 'react';
import { ITask, TaskHelper, Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { callTypes, CallTypeButtonsEntry } from 'hrm-form-definitions';

import { namespace, contactFormsBase, configurationBase, connectedCaseBase, RootState } from '../../states';
import { updateCallType } from '../../states/contacts/actions';
import { changeRoute } from '../../states/routing/actions';
import { withLocalization } from '../../contexts/LocalizationContext';
import { Box, Flex } from '../../styles/HrmStyles';
import { Container, Label, DataCallTypeButton, NonDataCallTypeButton } from '../../styles/callTypeButtons';
import { isNonDataCallType } from '../../states/ValidationRules';
import NonDataCallTypeDialog from './NonDataCallTypeDialog';
import { hasTaskControl } from '../../utils/transfer';
import { getConfig } from '../../HrmFormPlugin';
import { submitContactForm, completeTask } from '../../services/formSubmissionHelpers';
import CallTypeIcon from '../common/icons/CallTypeIcon';
import { CustomITask, isOfflineContactTask } from '../../types/types';

const isDialogOpen = contactForm =>
  Boolean(contactForm && contactForm.callType && contactForm.callType && isNonDataCallType(contactForm.callType));

const clearCallType = props => props.dispatch(updateCallType(props.task.taskSid, ''));

type OwnProps = {
  task: CustomITask;
  localization: { manager: { status: any }; isCallTask: (task: ITask) => boolean };
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CallTypeButtons: React.FC<Props> = props => {
  const { contactForm, task, localization, currentDefinitionVersion, caseForm } = props;
  const { isCallTask } = localization;

  // Todo: need to handle this error scenario in a better way. Currently is showing a blank screen if there aren't definitions.
  if (!currentDefinitionVersion) return null;
  const { callTypeButtons } = currentDefinitionVersion;

  const handleClick = (taskSid: string, callTypeEntry: CallTypeButtonsEntry) => {
    if (!hasTaskControl(task)) return;

    /*
     *  TODO: We currently save the call type name in English if data or the label string if non-data.
     * I think we should actually save callType.name (instead of label) on the DB, and use it in here.
     */
    const callType = callTypes[callTypeEntry.name] ? callTypes[callTypeEntry.name] : callTypeEntry.label;

    props.dispatch(updateCallType(taskSid, callType));
  };

  const handleClickAndRedirect = (taskSid: string, callTypeEntry: CallTypeButtonsEntry) => {
    if (!hasTaskControl(task)) return;

    // eslint-disable-next-line no-nested-ternary
    const subroute = isOfflineContactTask(task)
      ? 'contactlessTask'
      : callTypeEntry.name === 'caller'
      ? 'callerInformation'
      : 'childInformation';

    handleClick(taskSid, callTypeEntry);
    props.dispatch(changeRoute({ route: 'tabbed-forms', subroute, autoFocus: true }, taskSid));
  };

  const handleNonDataClick = (taskSid: string, callTypeEntry: CallTypeButtonsEntry) => {
    if (isOfflineContactTask(task)) {
      handleClickAndRedirect(taskSid, callTypeEntry);
    } else {
      handleClick(taskSid, callTypeEntry);
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
          {callTypeButtons
            .filter(entry => entry.category === 'data')
            .map((callType, index) => {
              return (
                <DataCallTypeButton
                  onClick={() => handleClickAndRedirect(task.taskSid, callType)}
                  key={callType.name}
                  autoFocus={index === 0}
                >
                  <Flex width="50px" marginRight="5px">
                    {/* TODO: We currently need the call type name in English. I think we should actually save callType.name (instead of label) on the DB, and use it in here.  */}
                    <CallTypeIcon callType={callTypes[callType.name]} />
                  </Flex>
                  {callType.label}
                </DataCallTypeButton>
              );
            })}
        </Box>

        <Box>
          <Label style={{ width: 'auto' }}>
            <Template code="CallTypeButtons-Or" />
          </Label>
          {callTypeButtons
            .filter(entry => entry.category === 'non-data')
            .map((callType, i) => (
              <NonDataCallTypeButton
                key={callType.name}
                onClick={() => handleNonDataClick(task.taskSid, callType)}
                marginRight={i % 2 === 0}
              >
                {callType.label}
              </NonDataCallTypeButton>
            ))}
        </Box>
      </Container>
      <NonDataCallTypeDialog
        isOpen={isDialogOpen(contactForm)}
        isCallTask={!isOfflineContactTask(task) && isCallTask(task)}
        isInWrapupMode={!isOfflineContactTask(task) && TaskHelper.isInWrapupMode(task)}
        handleConfirm={handleConfirmNonDataCallType}
        handleCancel={() => clearCallType(props)}
      />
    </>
  );
};

CallTypeButtons.displayName = 'CallTypeButtons';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const contactForm = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const caseState = state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid];
  const caseForm = caseState && caseState.connectedCase;
  const { currentDefinitionVersion } = state[namespace][configurationBase];

  return { contactForm, caseForm, currentDefinitionVersion };
};

const connector = connect(mapStateToProps);
const connected = connector(CallTypeButtons);

export default withLocalization(connected);
