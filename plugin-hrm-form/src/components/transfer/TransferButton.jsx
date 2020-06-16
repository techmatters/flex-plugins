import React from 'react';
import { Actions, Template } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import { StyledButton } from '../../styles/HrmStyles';

const TransferButton = ({ theme }) => {
  return (
    <StyledButton
      color={theme.colors.base11}
      background={theme.colors.base2}
      onClick={() => Actions.invokeAction('ShowDirectory')}
    >
      <Template code="Transfer-TransferButton" />
    </StyledButton>
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
