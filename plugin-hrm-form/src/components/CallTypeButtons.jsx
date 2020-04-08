import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';
import FaceIcon from '@material-ui/icons/Face';

import { withLocalization } from '../contexts/LocalizationContext';
import { Box, Row } from '../Styles/HrmStyles';
import {
  Container,
  Label,
  DataCallTypeButton,
  NonDataCallTypeButton,
  CloseTaskDialog,
  CloseTaskDialogText,
  ConfirmButton,
  CancelButton,
  CloseButton,
} from '../Styles/callTypeButtons';
import callTypes from '../states/DomainConstants';
import { isNonDataCallType } from '../states/ValidationRules';
import { formType, taskType, localizationType } from '../types';

const isDialogOpen = form => form && form.callType && form.callType.value && isNonDataCallType(form.callType.value);

const clearCallType = props => props.handleCallTypeButtonClick(props.task.taskSid, '');

const CallTypeButtons = props => {
  const { form, task, localization } = props;
  const { strings, isCallTask } = localization;

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
      <CloseTaskDialog onClose={() => clearCallType(props)} open={isDialogOpen(form)}>
        <Box marginLeft="auto">
          <CloseButton onClick={() => clearCallType(props)} />
        </Box>
        <CloseTaskDialogText>Are you sure?</CloseTaskDialogText>
        <Box marginBottom="32px">
          <Row>
            <ConfirmButton onClick={() => props.handleSubmit(task)}>
              {isCallTask(task) ? strings.TaskHeaderEndCall : strings.TaskHeaderEndChat}
            </ConfirmButton>
            <CancelButton onClick={() => clearCallType(props)}>Cancel</CancelButton>
          </Row>
        </Box>
      </CloseTaskDialog>
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
