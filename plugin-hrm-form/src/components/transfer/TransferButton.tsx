/* eslint-disable react/prop-types */
import React from 'react';
import { Actions, Template } from '@twilio/flex-ui';

import { TransferStyledButton } from '../../styles/HrmStyles';
import HhrTheme from '../../styles/HrmTheme';

type Props = {};

const TransferButton: React.FC<Props> = () => {
  return (
    <TransferStyledButton
      color={HhrTheme.colors.secondaryButtonTextColor}
      background={HhrTheme.colors.secondaryButtonColor}
      onClick={() => Actions.invokeAction('ShowDirectory')}
      data-fs-id="Task-Transfer-Button"
    >
      <Template code="Transfer-TransferButton" />
    </TransferStyledButton>
  );
};

TransferButton.displayName = 'TransferButton';

export default TransferButton;
