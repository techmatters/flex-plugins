/* eslint-disable react/prop-types */
import React from 'react';
import { withTaskContext, TaskHelper, Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { namespace, contactFormsBase, configurationBase, RootState } from '../../states';
import { updateCallType } from '../../states/contacts/actions';
import { changeRoute } from '../../states/routing/actions';
import { withLocalization } from '../../contexts/LocalizationContext';
import { Box, Flex } from '../../styles/HrmStyles';
import { Container, Label, DataCallTypeButton, NonDataCallTypeButton } from '../../styles/callTypeButtons';
import callTypes, { CallTypes } from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/ValidationRules';
import NonDataCallTypeDialog from './NonDataCallTypeDialog';
import { hasTaskControl } from '../../utils/transfer';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm } from '../../services/ContactService';
import CallTypeIcon from '../common/icons/CallTypeIcon';
import { DefinitionVersion } from '../common/forms/types';

const isDialogOpen = contactForm =>
  Boolean(contactForm && contactForm.callType && contactForm.callType && isNonDataCallType(contactForm.callType));

const clearCallType = props => props.dispatch(updateCallType(props.task.taskSid, ''));

type OwnProps = {
  task: any;
  localization: any;
  handleCompleteTask: any;
  currentDefinitionVersion: DefinitionVersion;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const CallTypeButtons: React.FC<Props> = props => {
  const { contactForm, task, localization, currentDefinitionVersion } = props;
  const { isCallTask } = localization;

  // Todo: need to handle this error scenario in a better way. Currently is showing a blank screen if there aren't definitions.
  if (!currentDefinitionVersion) return null;
  const { callTypeButtons } = currentDefinitionVersion;

  const handleClick = (taskSid: string, callType: CallTypes) => {
    if (!hasTaskControl(task)) return;

    props.dispatch(updateCallType(taskSid, callType));
  };

  const handleClickAndRedirect = (taskSid: string, callType: CallTypes) => {
    if (!hasTaskControl(task)) return;

    // eslint-disable-next-line no-nested-ternary
    const subroute = task.attributes.isContactlessTask
      ? 'contactlessTask'
      : callType === callTypes.caller
      ? 'callerInformation'
      : 'childInformation';

    handleClick(taskSid, callType);
    props.dispatch(changeRoute({ route: 'tabbed-forms', subroute }, taskSid));
  };

  const handleNonDataClick = (taskSid: string, callType: CallTypes) => {
    if (task.attributes.isContactlessTask) {
      handleClickAndRedirect(taskSid, callType);
    } else {
      handleClick(taskSid, callType);
    }
  };

  const handleConfirmNonDataCallType = async () => {
    if (!hasTaskControl(task)) return;

    const { hrmBaseUrl, workerSid, helpline, strings } = getConfig();

    try {
      await saveToHrm(task, contactForm, hrmBaseUrl, workerSid, helpline);
      props.handleCompleteTask(task.taskSid, task);
    } catch (error) {
      if (!window.confirm(strings['Error-ContinueWithoutRecording'])) {
        props.handleCompleteTask(task.taskSid, task);
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
            .map(callType => {
              return (
                <DataCallTypeButton
                  onClick={() => handleClickAndRedirect(task.taskSid, callType.label)}
                  key={callType.name}
                >
                  <Flex width="50px" marginRight="5px">
                    <CallTypeIcon callType={callType.label} />
                  </Flex>
                  <Template code={`CallType-${callType.name}`} />
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
                onClick={() => handleNonDataClick(task.taskSid, callType.label)}
                marginRight={i % 2 === 0}
              >
                <Template code={`CallType-${callType.name}`} />
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

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const contactForm = state[namespace][contactFormsBase].tasks[ownProps.task.taskSid];
  const { currentDefinitionVersion } = state[namespace][configurationBase];
  return { contactForm, currentDefinitionVersion };
};

const connector = connect(mapStateToProps);
const connected = connector(CallTypeButtons);

export default withLocalization(withTaskContext<Props, typeof connected>(connected));
