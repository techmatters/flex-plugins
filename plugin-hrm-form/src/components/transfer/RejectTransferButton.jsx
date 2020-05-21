import React from 'react';
import { TaskHelper } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import { StyledButton } from '../../styles/HrmStyles';
import { resolveTransferChat, closeCallSelf, setTransferRejected } from './helpers';
import { transferStatuses } from '../../states/DomainConstants';

const handleRejectTransfer = async transferredTask => {
  if (TaskHelper.isChatBasedTask(transferredTask)) {
    const closeSid = transferredTask.taskSid;
    const keepSid = transferredTask.attributes.transferMeta.originalTask;
    await resolveTransferChat(closeSid, keepSid, transferStatuses.completed);
  } else {
    await closeCallSelf(transferredTask);
    await setTransferRejected(transferredTask);
  }
};

const RejectTransferButton = ({ theme, task }) => {
  return (
    <StyledButton
      color={theme.colors.base11}
      background={theme.colors.base2}
      onClick={() => handleRejectTransfer(task)}
    >
      Reject Transfer
    </StyledButton>
  );
};

RejectTransferButton.displayName = 'RejectTransferButton';
RejectTransferButton.propTypes = {
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

export default RejectTransferButton;
