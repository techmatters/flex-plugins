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
import { ButtonBase } from '@material-ui/core';
import { styled, Button } from '@twilio/flex-ui';
import { getBackgroundWithHoverCSS } from '@twilio/flex-ui-core';

import HrmTheme from './HrmTheme';

type TransferStyledButtonProps = {
  background?: string;
  color?: string;
  taller?: boolean;
};

// This should be called SecondaryButton /TeritaryButton
// Used in 4 instances - 3 for transfer (accept, reject, transfer) and 1 for unmasking identifiers
export const TransferStyledButton = styled('button')<TransferStyledButtonProps>`
  background: ${props => (props.background ? props.background : '#ccc')};
  color: ${props => (props.color ? props.color : '#000')};
  letter-spacing: 0px;
  text-transform: none;
  margin-right: 1em;
  padding: 0px 16px;
  height: ${props => (props.taller ? 35 : 28)}px;
  font-size: 13px;
  outline: none;
  border-radius: 4px;
  border: none;
  align-self: center;
  font-weight: 600;
  &:hover:not([disabled]) {
    cursor: pointer;
    border: 1px solid gray;
    padding: 0px 15px;
  }
  &:focus:not([disabled]) {
    outline: auto;
    outline-color: #1976d2;
  }
  &:active:not([disabled]) {
    background: rgb(172, 179, 181);
  }
  &:disabled {
    opacity: 50%;
  }
`;
TransferStyledButton.displayName = 'TransferStyledButton';

type StyledNextStepButtonProps = {
  secondary?: string; // string to prevent console errors
  disabled?: boolean;
  margin?: string;
};

// Primary button
export const StyledNextStepButton = styled(Button)<StyledNextStepButtonProps>`
  display: flex;
  align-items: center;
  font-size: 13px;
  letter-spacing: normal;
  color: ${props =>
    props.secondary?.toLowerCase() === 'true'
      ? HrmTheme.colors.secondaryButtonTextColor
      : HrmTheme.colors.buttonTextColor};
  border: none;
  border-radius: 4px;
  margin: ${props => (props.margin ? props.margin : '0')};
  padding: 4px 10px;
  min-width: auto;
  background-color: ${props =>
    props.disabled
      ? HrmTheme.colors.disabledColor
      : props.secondary?.toLowerCase() === 'true'
      ? HrmTheme.colors.secondaryButtonColor
      : HrmTheme.colors.defaultButtonColor};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  ${p =>
    getBackgroundWithHoverCSS(
      p.disabled
        ? HrmTheme.colors.base5
        : p.secondary?.toLowerCase() === 'true'
        ? HrmTheme.colors.secondaryButtonColor
        : HrmTheme.colors.defaultButtonColor,
      true,
      false,
      p.disabled,
    )};

  &&:focus {
    outline-style: auto;
    outline-width: initial;
  }

  &&:active {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;
StyledNextStepButton.displayName = 'StyledNextStepButton';

// Secondary/tertiary button
export const SaveAndEndButton = styled(Button)<StyledNextStepButtonProps>`
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: normal;
  color: ${HrmTheme.colors.buttonTextColor};
  background: linear-gradient(to top, ${HrmTheme.colors.declineColor}, ${HrmTheme.colors.declineColor});
  border: none;
  padding: 4px 10px;
  min-width: auto;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

  &&:focus {
    outline-style: auto;
    outline-width: initial;
  }

  &&:active {
    background-color: #d61f1f;
  }

  &&:hover {
    background-color: #4a0b0b;
  }
`;
SaveAndEndButton.displayName = 'SaveAndEndButton';

const TabbedFormsHeaderButton = styled(ButtonBase)`
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
TabbedFormsHeaderButton.displayName = 'TabbedFormsHeaderButton';

export const StyledBackButton = TabbedFormsHeaderButton;
StyledBackButton.displayName = 'StyledBackButton';

export const StyledCSAMReportButton = TabbedFormsHeaderButton;
StyledCSAMReportButton.displayName = 'StyledCSAMReportButton';

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
