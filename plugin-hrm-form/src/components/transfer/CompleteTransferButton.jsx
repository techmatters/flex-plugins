import React from 'react';
import { TaskHelper } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import { StyledButton } from '../../styles/HrmStyles';
import { closeTransfer, completeTransfer } from './helpers';

const handleCompleteTransfer = async transferredTask => {
  const originalTask = TaskHelper.getTaskByTaskSid(transferredTask.attributes.transferMeta.originalReservation);
  await closeTransfer(originalTask);

  await completeTransfer(transferredTask);
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
