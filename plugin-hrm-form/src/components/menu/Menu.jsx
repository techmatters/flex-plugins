import React from 'react';
import PropTypes from 'prop-types';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';

import { StyledPaper } from '../../styles/menu';

const preventWhenClickingAnchorEl = (fn, anchorEl) => event => {
  if (anchorEl.contains(event.target)) return;
  fn(event);
};

const Menu = ({ open, anchorEl, children, onClickAway }) => (
  <Popper open={open} anchorEl={anchorEl}>
    <StyledPaper>
      <ClickAwayListener onClickAway={preventWhenClickingAnchorEl(onClickAway, anchorEl)}>
        <MenuList>{children}</MenuList>
      </ClickAwayListener>
    </StyledPaper>
  </Popper>
);

Menu.displayName = 'Menu';
Menu.propTypes = {
  open: PropTypes.bool.isRequired,
  anchorEl: PropTypes.instanceOf(Element).isRequired,
  onClickAway: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
};
Menu.defaultProps = {
  children: null,
};

export default Menu;
