import React from 'react';
import PropTypes from 'prop-types';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import { StyledPopper, StyledPaper, StyledMenuList } from '../../styles/menu';

const preventWhenClickingAnchorEl = (fn, anchorEl) => event => {
  if (anchorEl.contains(event.target)) return;
  fn(event);
};

/**
 * TODO: If we want to make this component close on hitting ESC,
 * we need to use Material's Menu instead of MenuItem, because it supports onClose method
 */
const Menu = ({ open, anchorEl, children, onClickAway }) => (
  <StyledPopper open={open} anchorEl={anchorEl}>
    <StyledPaper>
      <ClickAwayListener onClickAway={preventWhenClickingAnchorEl(onClickAway, anchorEl)}>
          <StyledMenuList innerRef={rootRef => open && rootRef?.firstChild?.focus()}>{children}</StyledMenuList>
      </ClickAwayListener>
    </StyledPaper>
  </StyledPopper>
);

Menu.displayName = 'Menu';
Menu.propTypes = {
  open: PropTypes.bool.isRequired,
  anchorEl: PropTypes.instanceOf(Element),
  onClickAway: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
};
Menu.defaultProps = {
  anchorEl: null,
  children: null,
};

export default Menu;
