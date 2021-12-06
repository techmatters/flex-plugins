/* eslint-disable react/prop-types */
import React from 'react';
import { Actions, Template } from '@twilio/flex-ui';

import { TransferStyledButton } from '../../styles/HrmStyles';
import HhrTheme from '../../styles/HrmTheme';

type Props = typeof HhrTheme;

const TransferButton: React.FC<Props> = ({ theme }) => {
  return (
    <TransferStyledButton
      color={theme.colors.secondaryButtonTextColor}
      background={theme.colors.secondaryButtonColor}
      onClick={() => Actions.invokeAction('ShowDirectory')}
      data-fs-id="Task-Transfer-Button"
    >
      <Template code="Transfer-TransferButton" />
    </TransferStyledButton>
  );
};

TransferButton.displayName = 'TransferButton';

export default TransferButton;
