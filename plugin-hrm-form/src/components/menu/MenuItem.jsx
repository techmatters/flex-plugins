import React from 'react';
import PropTypes from 'prop-types';
import { withTheme } from '@twilio/flex-ui';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { StyledMenuItem, StyledListItemText, NoIcon } from '../../styles/menu';

const MenuItem = ({ Icon, text, red, onClick, theme }) => (
  <StyledMenuItem onClick={onClick}>
    <ListItemIcon>
      {Icon ? <Icon nativeColor={red ? theme.colors.declineColor : theme.colors.defaultButtonColor} /> : <NoIcon />}
    </ListItemIcon>
    <StyledListItemText primary={text} red={red} />
  </StyledMenuItem>
);

MenuItem.displayName = 'MenuItem';
MenuItem.propTypes = {
  Icon: PropTypes.elementType,
  text: PropTypes.string.isRequired,
  red: PropTypes.bool,
  onClick: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  theme: PropTypes.object.isRequired,
};
MenuItem.defaultProps = {
  Icon: null,
  red: false,
  onClick: () => null,
};

export default withTheme(MenuItem);
