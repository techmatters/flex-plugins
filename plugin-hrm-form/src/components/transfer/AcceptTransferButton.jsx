import React from 'react';
import { TaskHelper, Template } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import { TransferStyledButton } from '../../styles/HrmStyles';
import { closeCallOriginal } from '../../utils/transfer';

/**
 * @param {import('@twilio/flex-ui').ITask} task the transferred task
 */
const handleAcceptTransfer = async task => {
  if (TaskHelper.isChatBasedTask(task)) return; // this case should never happend

  await closeCallOriginal(task);
};

const AcceptTransferButton = ({ theme, task }) => {
  return (
    <TransferStyledButton
      color={theme.colors.base11}
      background={theme.colors.base1}
      taller
      onClick={() => handleAcceptTransfer(task)}
    >
      <Template code="Transfer-AcceptTransferButton" />
    </TransferStyledButton>
  );
};

AcceptTransferButton.displayName = 'AcceptTransferButton';
AcceptTransferButton.propTypes = {
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

export default AcceptTransferButton;
