import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext, Template } from '@twilio/flex-ui';
import FaceIcon from '@material-ui/icons/Face';

import { withLocalization } from '../../contexts/LocalizationContext';
import { Box } from '../../styles/HrmStyles';
import { Container, Label, DataCallTypeButton, NonDataCallTypeButton } from '../../styles/callTypeButtons';
import callTypes from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/ValidationRules';
import { formType, taskType, localizationType } from '../../types';
import NonDataCallTypeDialog from './NonDataCallTypeDialog';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm } from '../../services/ContactService';
import { fillEndMillis } from '../../utils/conversationDuration';

const isDialogOpen = form =>
  Boolean(form && form.callType && form.callType.value && isNonDataCallType(form.callType.value));

const clearCallType = props => props.handleCallTypeButtonClick(props.task.taskSid, '');

const CallTypeButtons = props => {
  const { form, task, localization } = props;
  const { isCallTask } = localization;

  const handleClick = (taskSid, callType) => {
    props.handleCallTypeButtonClick(taskSid, callType);
    props.changeRoute('tabbed-forms', taskSid);
  };

  const handleConfirmNonDataCallType = async () => {
    const { hrmBaseUrl, workerSid, helpline } = getConfig();

    try {
      const formWithEndMillis = fillEndMillis(form);
      await saveToHrm(task, formWithEndMillis, hrmBaseUrl, workerSid, helpline);
      props.handleCompleteTask(task.taskSid, task);
    } catch (error) {
      if (!window.confirm('Error from backend system.  Are you sure you want to end the task without recording?')) {
        props.handleCompleteTask(task.taskSid, task);
      }
    }
  };

  return (
    <>
      <Container>
        <Box marginBottom="29px">
          <Label>categorize this contact</Label>
          <DataCallTypeButton onClick={() => handleClick(task.taskSid, callTypes.child)}>
            <Box width="50px" marginRight="5px">
              <FaceIcon />
            </Box>
            <Template code="CallType-child" />
          </DataCallTypeButton>
          <DataCallTypeButton onClick={() => handleClick(task.taskSid, callTypes.caller)}>
            <Box width="50px" marginRight="5px">
              <FaceIcon style={{ marginRight: '-5px' }} />
              <FaceIcon />
            </Box>
            <Template code="CallType-caller" />
          </DataCallTypeButton>
        </Box>

        <Box>
          <Label>Or was this contact…</Label>
          {Object.keys(callTypes)
            .filter(callType => isNonDataCallType(callTypes[callType]))
            .map((callType, i) => (
              <NonDataCallTypeButton
                key={callType}
                onClick={() => props.handleCallTypeButtonClick(task.taskSid, callTypes[callType])}
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
