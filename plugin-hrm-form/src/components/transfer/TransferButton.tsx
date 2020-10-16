/* eslint-disable react/prop-types */
import React from 'react';
import { Actions, Template, ThemeProps } from '@twilio/flex-ui';

import { TransferStyledButton } from '../../styles/HrmStyles';

type Props = ThemeProps & {};

const TransferButton: React.FC<Props> = ({ theme }) => {
  return (
    <TransferStyledButton
      color={theme.colors.base11}
      background={theme.colors.base1}
      onClick={() => Actions.invokeAction('ShowDirectory')}
    >
      <Template code="Transfer-TransferButton" />
    </TransferStyledButton>
  );
};

TransferButton.displayName = 'TransferButton';

export default TransferButton;
