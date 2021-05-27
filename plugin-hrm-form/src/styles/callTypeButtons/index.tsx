import React from 'react';
import styled from 'react-emotion';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import ClearIcon from '@material-ui/icons/Clear';
import { IconButton } from '@material-ui/core';
import { Button, getBackgroundWithHoverCSS } from '@twilio/flex-ui';

export const Container = styled('div')`
  width: 300px;
  margin: 75px auto auto auto;
`;

export const Label = styled('p')`
  text-transform: uppercase;
  margin-bottom: 10px;
  font-weight: 700;
  color: #192b33;
  font-size: 10px;
  letter-spacing: 1.25px;
  line-height: 12px;
`;

export const DataCallTypeButton = styled(Button)`
  display: flex;
  align-items: center;
  width: 300px;
  height: 44px;
  margin: 0 0 10px 0;
  padding-left: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: normal;
  color: #1d2e36;
  border-radius: 4px;
  background-color: #d1e3f6;

  &:hover {
    background-color: #7fa3cb;
  }

  &:focus {
    outline: auto;
  }
`;

DataCallTypeButton.displayName = 'DataCallTypeButton';

type NonDataCallTypeButtonProps = {
  marginRight: boolean;
};

export const NonDataCallTypeButton = styled(Button)<NonDataCallTypeButtonProps>`
  width: 140px;
  height: 44px;
  margin-bottom: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 10px 0;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: normal;
  color: #1d2e36;
  border-radius: 4px;
  background-color: #ecedf1;
  ${props => props.marginRight && 'margin-right: 20px;'}

  &:hover {
    background-color: #b1b6c0;
  }

  &:focus {
    outline: auto;
  }
`;

export const CloseTaskDialog = styled<DialogProps>(props => <Dialog {...props} classes={{ paper: 'paper' }} />)`
  && .paper {
    width: 350px;
  }
`;

export const NonDataCallTypeDialogContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
`;

export const CloseTaskDialogText = styled('p')`
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 36px;
`;

type ConfirmButtonProps = {
  disabled: boolean;
};

export const ConfirmButton = styled(Button)<ConfirmButtonProps>`
  text-transform: uppercase;
  color: ${props => props.theme.colors.declineTextColor};
  ${p => getBackgroundWithHoverCSS(p.theme.colors.declineColor, true, false, p.disabled)};

  &:focus {
    outline-color: #4d90fe;
    outline-style: auto;
    outline-width: initial;
  }
`;

export const CancelButton = styled(Button)`
  text-transform: uppercase;
  margin-left: 30px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
    background-blend-mode: color;
  }

  &:focus {
    outline: auto;
  }
`;

export const CloseButton = styled(props => (
  <IconButton {...props} classes={{ label: 'label' }}>
    <ClearIcon />
  </IconButton>
))`
  && .label {
    color: ${props => props.theme.colors.defaultButtonColor};
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  &:focus {
    outline: auto;
  }
`;
