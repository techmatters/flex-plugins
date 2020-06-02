import React from 'react';
import { TaskHelper } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import { StyledButton } from '../../styles/HrmStyles';
import { closeChatSelf, closeCallSelf } from '../../utils/transfer';

/**
 * @param {import('@twilio/flex-ui').ITask} task the transferred task
 */
const handleRejectTransfer = async task => {
  if (TaskHelper.isChatBasedTask(task)) closeChatSelf(task);
  else await closeCallSelf(task);
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
