import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext, TaskHelper, Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { withLocalization } from '../../contexts/LocalizationContext';
import { Box, Flex } from '../../styles/HrmStyles';
import { Container, Label, DataCallTypeButton, NonDataCallTypeButton } from '../../styles/callTypeButtons';
import callTypes from '../../states/DomainConstants';
import { updateCallType } from '../../states/contacts/actions';
import { isNonDataCallType } from '../../states/ValidationRules';
import { namespace, contactsBase } from '../../states';
import { taskType, localizationType } from '../../types';
import NonDataCallTypeDialog from './NonDataCallTypeDialog';
import { hasTaskControl } from '../../utils/transfer';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm } from '../../services/ContactService';
import CallTypeIcon from '../common/icons/CallTypeIcon';

const isDialogOpen = form => Boolean(form && form.callType && form.callType && isNonDataCallType(form.callType));

const clearCallType = props => props.dispatch(updateCallType(props.task.taskSid, ''));

const CallTypeButtons = props => {
  const { contactForm, task, localization } = props;
  const { isCallTask } = localization;

  const handleClick = (taskSid, callType) => {
    if (!hasTaskControl(task)) return;

    props.dispatch(updateCallType(taskSid, callType));
  };

  const handleClickAndRedirect = (taskSid, callType) => {
    if (!hasTaskControl(task)) return;

    const subroute = callType === callTypes.child ? 'childInformation' : 'callerInformation';
    handleClick(taskSid, callType);
    props.changeRoute({ route: 'tabbed-forms', subroute }, taskSid);
  };

  const handleConfirmNonDataCallType = async () => {
    if (!hasTaskControl(task)) return;

    const { hrmBaseUrl, workerSid, helpline, strings } = getConfig();

    try {
      await saveToHrm(task, contactForm, hrmBaseUrl, workerSid, helpline);
      // props.handleCompleteTask(task.taskSid, task);
    } catch (error) {
      console.error(error);
      if (window.confirm(strings['Error-ContinueWithoutRecording'])) {
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
  dispatch: PropTypes.func.isRequired,
  contactForm: PropTypes.shape().isRequired,
  task: taskType.isRequired,
  localization: localizationType.isRequired,
  changeRoute: PropTypes.func.isRequired,
  handleCompleteTask: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const contactForm = state[namespace][contactsBase].tasks[ownProps.task.taskSid];
  return { contactForm };
};

const connector = connect(mapStateToProps);
const connected = connector(CallTypeButtons);

export default withLocalization(withTaskContext(connected));
