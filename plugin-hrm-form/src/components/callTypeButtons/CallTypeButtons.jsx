import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';
import FaceIcon from '@material-ui/icons/Face';

import { withLocalization } from '../../contexts/LocalizationContext';
import { Box } from '../../styles/HrmStyles';
import { Container, Label, DataCallTypeButton, NonDataCallTypeButton } from '../../styles/callTypeButtons';
import callTypes from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/ValidationRules';
import { formType, taskType, localizationType } from '../../types';
import NonDataCallTypeDialog from './NonDataCallTypeDialog';

const isDialogOpen = form =>
  Boolean(form && form.callType && form.callType.value && isNonDataCallType(form.callType.value));

const clearCallType = props => props.handleCallTypeButtonClick(props.task.taskSid, '');

const CallTypeButtons = props => {
  const { form, task, localization } = props;
  const { isCallTask } = localization;

  return (
    <>
      <Container>
        <Box marginBottom="29px">
          <Label>categorize this contact</Label>
          <DataCallTypeButton onClick={() => props.handleCallTypeButtonClick(task.taskSid, callTypes.child)}>
            <Box width="50px" marginRight="5px">
              <FaceIcon />
            </Box>
            {callTypes.child}
          </DataCallTypeButton>
          <DataCallTypeButton onClick={() => props.handleCallTypeButtonClick(task.taskSid, callTypes.caller)}>
            <Box width="50px" marginRight="5px">
              <FaceIcon style={{ marginRight: '-5px' }} />
              <FaceIcon />
            </Box>
            {callTypes.caller}
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
                {callTypes[callType]}
              </NonDataCallTypeButton>
            ))}
        </Box>
      </Container>
      <NonDataCallTypeDialog
        isOpen={isDialogOpen(form)}
        isCallTask={isCallTask(task)}
        handleConfirm={() => props.handleSubmit(task)}
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
  handleSubmit: PropTypes.func.isRequired,
  localization: localizationType.isRequired,
};

export default withLocalization(withTaskContext(CallTypeButtons));
