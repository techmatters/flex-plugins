/* eslint-disable no-nested-ternary */
/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import React from 'react';
import { ButtonBase, withStyles, IconButton } from '@material-ui/core';
import { styled, Button } from '@twilio/flex-ui';
import ClearIcon from '@material-ui/icons/Clear';

import HrmTheme from './HrmTheme';

type AseloBaseButtonProps = {
  disabled?: boolean;
  buttonSize?: 'small' | 'large';
  buttonType?: 'primary' | 'secondary' | 'destructive' | 'tertiary';
  icon?: 'left' | 'right';
};

export const AseloBaseButton = styled(Button)<AseloBaseButtonProps>`
  display: flex;
  align-items: center;
  background-color: ${({ disabled, buttonType = 'primary' }) =>
    disabled ? HrmTheme.buttonColors[buttonType].disabled : HrmTheme.buttonColors[buttonType].default};
  font-size: ${({ buttonSize }) => (buttonSize === 'large' ? '16px' : '14px')};
  padding: ${({ buttonSize }) => (buttonSize === 'large' ? '12px 24px' : '4px 10px')};

  letter-spacing: normal;
  color: ${({ buttonType }) => HrmTheme.buttonColors[buttonType].textColor};
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s ease;

  &:focus {
    outline: 2px solid #22a3fa;
  }

  &:hover:not([disabled]) {
    background: ${({ buttonType }) => HrmTheme.buttonColors[buttonType].hover};
  }

  &:active:not([disabled]) {
    background: ${({ buttonType }) => HrmTheme.buttonColors[buttonType].pressed};
  }

  &:focus:not([disabled]) {
    outline: 2px solid #22a3fa;
    outline-offset: 2px;
  }
`;

/**
 * Primary Button: Highlights the most important action a user should take, often leading to a conversion or completion of a task.
 * There is typically only one primary button per view, unless multiple actions are equally important,
 * but that should be very rare, if ever in Aselo. We want the user to not have to think.
 */
export const PrimaryButton = (props: React.ComponentProps<typeof AseloBaseButton>) => (
  <AseloBaseButton {...props} buttonType="primary" />
);

/**
 * Secondary Button: Indicates a less important action, often an alternative to the primary action.
 * Can be paired with a primary button to provide a negative action like "Cancel" or "Clear",
 * or used independently for less crucial tasks.
 */
export const SecondaryButton = (props: React.ComponentProps<typeof AseloBaseButton>) => (
  <AseloBaseButton {...props} buttonType="secondary" />
);

/**
 * Destructive Button: Used for potentially dangerous or destructive actions that require caution.
 */
export const DestructiveButton = (props: React.ComponentProps<typeof AseloBaseButton>) => (
  <AseloBaseButton {...props} buttonType="destructive" />
);

/**
 * Tertiary Button: Indicates a low-priority action or a supplemental action, often used for actions that are not critical for the main task.
 * Used for Add, Edit, Delete, Skip, Close, More, etc.
 */
export const TertiaryButton = (props: React.ComponentProps<typeof AseloBaseButton>) => (
  <AseloBaseButton {...props} buttonType="tertiary" />
);

/**
 * Transfer Button: Uses the secondary button style but slightly modified to match the flex-ui button style
 */
export const TransferButton = styled(SecondaryButton)`
  margin-right: 1em;
  padding: 4px 12px;
  font-size: 13px;
`;
TransferButton.displayName = 'TransferButton';

export const StyledBackButton = styled(ButtonBase)`
  &:focus {
    outline-color: ${HrmTheme.colors.focusColor};
    outline-style: solid;
    outline-width: medium;
  }

  &:hover {
    background-color: #f2f2f2;
    cursor: pointer;
  }
`;
StyledBackButton.displayName = 'StyledBackButton';

// Navigation close icon button
export const HeaderCloseButton = styled(ButtonBase)`
  && {
    margin-left: auto;
  }

  &:focus {
    outline-color: ${HrmTheme.colors.focusColor};
    outline-style: solid;
    outline-width: medium;
  }

  &:hover {
    background-color: #f2f2f2;
    cursor: pointer;
  }
`;
HeaderCloseButton.displayName = 'HeaderCloseButton';

export const TaskButtonBase = withStyles({
  root: {
    '&:hover': {
      backgroundColor: '#ECEDF1',
    },
    '&:hover > div': {
      backgroundColor: '#ECEDF1',
    },
  },
  disabled: {
    opacity: 0.3,
    color: '#192B33',
    '& svg': {
      color: '#192B33',
    },
    '& p': {
      color: '#192B33',
    },
  },
})(ButtonBase);

type ToggleViewButtonProps = { active?: boolean };

export const ToggleViewButton = styled('button')<ToggleViewButtonProps>`
  display: inline-flex;
  width: 37px;
  height: 37px;
  min-height: 37px;
  border-radius: 1px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  cursor: pointer;
  border: ${({ active }) => (active ? '1px solid #a0a8bd33' : 'none')};
  color: ${({ active }) => (active ? '#000000cc' : 'initial')};
  background-color: ${({ active }) => (active ? 'initial' : '#a0a8bdcc')};
  opacity: ${({ active }) => (active ? 'initial' : '20%')};

  &:focus {
    outline: auto;
  }

  > svg {
    font-size: 18px;
  }
`;
ToggleViewButton.displayName = 'ToggleViewButton';


type ConfirmButtonProps = {
  disabled: boolean;
};

const CloseDialogButton = styled(Button)`
  padding: 0px 16px;
  border: none;
  outline: none;
  align-self: center;
  height: 28px;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 2px;
  white-space: nowrap;
  border-radius: 100px;
  text-transform: uppercase;
`;

export const ConfirmButton = styled(CloseDialogButton)<ConfirmButtonProps>`
  text-transform: uppercase;
  color: ${props => HrmTheme.colors.declineTextColor};
  background: linear-gradient(to top, ${HrmTheme.colors.declineColor}, ${HrmTheme.colors.declineColor});

  &:hover {
    background-color: ${HrmTheme.colors.declineColor}CC;
    background-blend-mode: color;
  }

  &:focus {
    outline-style: auto;
    outline-width: initial;
  }
`;

export const CancelButton = styled(CloseDialogButton)`
  text-transform: uppercase;
  margin-left: 30px;
  color: rgb(0, 0, 0);
  background: linear-gradient(to top, ${HrmTheme.colors.buttonTextColor}, ${HrmTheme.colors.buttonTextColor});

  &:hover {
    background-color: ${HrmTheme.colors.buttonHoverColor};
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
    color: ${HrmTheme.colors.defaultButtonColor};
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  &:focus {
    outline: auto;
  }
`;
