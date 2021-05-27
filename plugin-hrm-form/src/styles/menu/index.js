import React from 'react';
import styled from 'react-emotion';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import CancelIcon from '@material-ui/icons/Cancel';

export const StyledPopper = styled(Popper)`
  & {
    z-index: 1;
  }
`;

export const StyledPaper = styled(Paper)`
  width: fit-content;
  margin: 20px;
`;

export const StyledMenuList = styled(MenuList)`
  &&:focus {
    outline: none;
  }
`;

export const StyledMenuItem = styled(props => <MenuItem {...props} classes={{ root: 'root' }} />)`
  &&.root {
    padding-top: 5px;
    padding-bottom: 5px;
  }
  &&:focus {
    outline: auto;
  }
`;

export const StyledListItemText = styled(props => <ListItemText {...props} classes={{ primary: 'primary' }} />)`
  && > .primary {
    font-size: 13px;
    color: ${props => (props.red ? props.theme.colors.declineColor : props.theme.colors.defaultButtonColor)};
  }
`;

export const NoIcon = styled(props => <CancelIcon nativeColor="transparent" />)``;
