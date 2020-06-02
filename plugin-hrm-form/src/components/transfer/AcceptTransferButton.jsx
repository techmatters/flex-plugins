import React from 'react';
import { TaskHelper } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import { StyledButton } from '../../styles/HrmStyles';
import { closeChatOriginal, closeCallOriginal } from '../../utils/transfer';

/**
 * @param {import('@twilio/flex-ui').ITask} task the transferred task
 */
const handleAcceptTransfer = async task => {
  if (TaskHelper.isChatBasedTask(task)) await closeChatOriginal(task);
  else await closeCallOriginal(task);
};

const AcceptTransferButton = ({ theme, task }) => {
  return (
    <StyledButton
      color={theme.colors.base11}
      background={theme.colors.base2}
      onClick={() => handleAcceptTransfer(task)}
    >
      Accept Transfer
    </StyledButton>
  );
};

AcceptTransferButton.displayName = 'AcceptTransferButton';
AcceptTransferButton.propTypes = {
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

export default AcceptTransferButton;
