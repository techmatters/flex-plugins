import React from 'react';
import PropTypes from 'prop-types';
import { withTheme } from '@twilio/flex-ui';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { StyledMenuItem, StyledListItemText, NoIcon } from '../../styles/menu';

const MenuItem = ({ Icon, text, red, onClick, theme }) => (
  <StyledMenuItem tabIndex={0} onClick={onClick}>
    <ListItemIcon>
      {Icon ? <Icon nativeColor={red ? theme.colors.declineColor : theme.colors.defaultButtonColor} /> : <NoIcon />}
    </ListItemIcon>
    <StyledListItemText primary={text} red={red} />
  </StyledMenuItem>
);

MenuItem.displayName = 'MenuItem';
MenuItem.propTypes = {
  Icon: PropTypes.elementType,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  red: PropTypes.bool,
  onClick: PropTypes.func,
  theme: PropTypes.shape({
    colors: PropTypes.shape({
      declineColor: PropTypes.string,
      defaultButtonColor: PropTypes.string,
    }),
  }).isRequired,
};
MenuItem.defaultProps = {
  Icon: null,
  red: false,
  onClick: () => null,
};

export default withTheme(MenuItem);
