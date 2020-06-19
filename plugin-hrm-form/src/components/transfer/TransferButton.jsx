import React from 'react';
import { Actions, Template } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import { TransferStyledButton } from '../../styles/HrmStyles';

const TransferButton = ({ theme }) => {
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
TransferButton.propTypes = {
  theme: PropTypes.shape({
    colors: PropTypes.shape({
      base2: PropTypes.string,
      base11: PropTypes.string,
    }),
  }).isRequired,
};

export default TransferButton;
