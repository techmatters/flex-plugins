import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext, TaskHelper, Template } from '@twilio/flex-ui';

import { withLocalization } from '../../contexts/LocalizationContext';
import { Box, Flex } from '../../styles/HrmStyles';
import { Container, Label, DataCallTypeButton, NonDataCallTypeButton } from '../../styles/callTypeButtons';
import callTypes from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/ValidationRules';
import { formType, taskType, localizationType } from '../../types';
import NonDataCallTypeDialog from './NonDataCallTypeDialog';
import { hasTaskControl } from '../../utils/transfer';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm } from '../../services/ContactService';
import CallTypeIcon from '../common/icons/CallTypeIcon';

const isDialogOpen = form =>
  Boolean(form && form.callType && form.callType.value && isNonDataCallType(form.callType.value));

const clearCallType = props => props.handleCallTypeButtonClick(props.task.taskSid, '');

const CallTypeButtons = props => {
  const { form, task, localization } = props;
  const { isCallTask } = localization;

  const handleClick = (taskSid, callType) => {
    if (!hasTaskControl(task)) return;

    props.handleCallTypeButtonClick(taskSid, callType);
  };

  const handleClickAndRedirect = (taskSid, callType) => {
    if (!hasTaskControl(task)) return;

    handleClick(taskSid, callType);
    props.changeRoute({ route: 'tabbed-forms' }, taskSid);
  };

  const handleConfirmNonDataCallType = async () => {
    if (!hasTaskControl(task)) return;

    const { hrmBaseUrl, workerSid, helpline, strings } = getConfig();

    try {
      await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);
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
                onClick={() => handleClick(task.taskSid, callTypes[callType])}
                marginRight={i % 2 === 0}
              >
                <Template code={`CallType-${callType}`} />
              </NonDataCallTypeButton>
            ))}
        </Box>
      </Container>
      <NonDataCallTypeDialog
        isOpen={isDialogOpen(form)}
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
  form: formType.isRequired,
  task: taskType.isRequired,
  handleCallTypeButtonClick: PropTypes.func.isRequired,
  localization: localizationType.isRequired,
  changeRoute: PropTypes.func.isRequired,
  handleCompleteTask: PropTypes.func.isRequired,
};

export default withLocalization(withTaskContext(CallTypeButtons));
