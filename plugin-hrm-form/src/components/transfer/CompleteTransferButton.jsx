import React from 'react';
import { TaskHelper } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import { StyledButton } from '../../styles/HrmStyles';
import { closeChatOriginal, closeCallOriginal, setTransferCompleted } from '../../utils/transfer';

/**
 * @param {import('@twilio/flex-ui').ITask} task the transferred task
 */
const handleCompleteTransfer = async task => {
  if (TaskHelper.isChatBasedTask(task)) {
    await closeChatOriginal(task);
  } else {
    await closeCallOriginal(task);
    await setTransferCompleted(task);
  }
};

const CompleteTransferButton = ({ theme, task }) => {
  return (
    <StyledButton
      color={theme.colors.base11}
      background={theme.colors.base2}
      onClick={() => handleCompleteTransfer(task)}
    >
      Accept Transfer
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
