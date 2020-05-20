import React from 'react';
import { Actions, StyledButton, withTheme } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

const TransferButton = ({ theme }) => {
  return (
    <StyledButton
      color={theme.colors.base11}
      background={theme.colors.base2}
      onClick={() => Actions.invokeAction('ShowDirectory')}
    >
      Transfer
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

export default withTheme(TransferButton);
