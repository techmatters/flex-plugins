import React from 'react';
import { TaskHelper, Template } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import { TransferStyledButton } from '../../styles/HrmStyles';
import { closeCallSelf } from '../../utils/transfer';

/**
 * @param {import('@twilio/flex-ui').ITask} task the transferred task
 */
const handleRejectTransfer = async task => {
  if (TaskHelper.isChatBasedTask(task)) return; // this case should never happend

  await closeCallSelf(task);
};

const RejectTransferButton = ({ theme, task }) => {
  return (
    <TransferStyledButton
      color={theme.colors.base11}
      background={theme.colors.base1}
      taller
      onClick={() => handleRejectTransfer(task)}
    >
      <Template code="Transfer-RejectTransferButton" />
    </TransferStyledButton>
  );
};

RejectTransferButton.displayName = 'RejectTransferButton';
RejectTransferButton.propTypes = {
  theme: PropTypes.shape({
    colors: PropTypes.shape({
      base1: PropTypes.string,
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
