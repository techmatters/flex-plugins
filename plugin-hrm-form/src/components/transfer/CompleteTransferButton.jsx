import React from 'react';
import { TaskHelper, StateHelper } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import { StyledButton } from '../../styles/HrmStyles';
import { resolveTransferChat, closeCallOriginal, setTransferCompleted } from './helpers';
import { transferStatuses } from '../../states/DomainConstants';

const handleCompleteTransfer = async transferredTask => {
  if (TaskHelper.isChatBasedTask(transferredTask)) {
    const closeSid = transferredTask.attributes.transferMeta.originalTask;
    const keepSid = transferredTask.taskSid;
    await resolveTransferChat(closeSid, keepSid, transferStatuses.completed);
  } else {
    await closeCallOriginal(transferredTask);
    await setTransferCompleted(transferredTask);
  }
};

const CompleteTransferButton = ({ theme, task }) => {
  return (
    <StyledButton
      color={theme.colors.base11}
      background={theme.colors.base2}
      onClick={() => handleCompleteTransfer(task)}
    >
      Complete Transfer
    </StyledButton>
  );
};

CompleteTransferButton.displayName = 'CompleteTransferButton';
CompleteTransferButton.propTypes = {
  theme: PropTypes.shape({
    colors: PropTypes.shape({
      base2: PropTypes.string,
      base11: PropTypes.string,
    }),
  }).isRequired,
  task: PropTypes.shape({
    attributes: PropTypes.shape({
      transferMeta: PropTypes.shape({
        transferStatus: PropTypes.string,
      }),
    }),
  }).isRequired,
};

export default CompleteTransferButton;
