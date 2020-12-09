/* eslint-disable react/prop-types */
import React from 'react';
import { TaskHelper, Template, ITask, ThemeProps } from '@twilio/flex-ui';

import { TransferStyledButton } from '../../styles/HrmStyles';
import { closeCallOriginal } from '../../utils/transfer';

const handleAcceptTransfer = async (task: ITask) => {
  if (TaskHelper.isChatBasedTask(task)) return; // this case should never happen

  await closeCallOriginal(task);
};

type Props = ThemeProps & { task: ITask };

const AcceptTransferButton: React.FC<Props> = ({ theme, task }) => {
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

export default AcceptTransferButton;
