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
import { ButtonBase, Tooltip, withStyles } from '@material-ui/core';
import { styled, Button } from '@twilio/flex-ui';
// import { getBackgroundWithHoverCSS } from '@twilio/flex-ui-core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

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
  color: ${({buttonType}) => HrmTheme.buttonColors[buttonType].textColor};
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s ease;

  &:hover:not([disabled]) {
    background: ${({ buttonType = 'primary' }) => HrmTheme.buttonColors[buttonType].hover};
  }

  &:active:not([disabled]) {
    background: ${({ buttonType = 'primary' }) => HrmTheme.buttonColors[buttonType].pressed};
  }

  &:focus:not([disabled]) {
    background: ${({ buttonType = 'primary' }) => HrmTheme.buttonColors[buttonType].focus};
    outline: 2px solid #22a3fa;
    outline-offset: 2px;
  }
`;

export const PrimaryButton = (props: React.ComponentProps<typeof AseloBaseButton>) => (
  <AseloBaseButton {...props} buttonType="primary" />
);

export const SecondaryButton = (props: React.ComponentProps<typeof AseloBaseButton>) => (
  <AseloBaseButton {...props} buttonType="secondary" />
);

export const DestructiveButton = (props: React.ComponentProps<typeof AseloBaseButton>) => (
  <AseloBaseButton {...props} buttonType="destructive" />
);

export const TertiaryyButton = (props: React.ComponentProps<typeof AseloBaseButton>) => (
  <AseloBaseButton {...props} buttonType="tertiary" />
);

export const TransferButton = styled(SecondaryButton)`
  margin-right: 1em;
  padding: 4px 12px;
  font-size: 13px;
`;
TransferButton.displayName = 'TransferButton';

type ButtonProps = {
  secondary?: string; // string to prevent console errors
  disabled?: boolean;
  margin?: string;
};

export const TertiaryButton = styled(Button)<ButtonProps>`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: normal;
  color: ${HrmTheme.colors.tertiaryButtonTextColor};
  border: none;
  border-radius: 4px;
  margin: ${props => (props.margin ? props.margin : '0')};
  padding: 4px 10px;
  min-width: auto;
  background-color: ${props => (props.disabled ? HrmTheme.colors.disabledColor : HrmTheme.colors.tertiaryButtonColor)};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

  &&:hover {
    background-color: ${p => (p.disabled ? `${HrmTheme.colors.base5}CC` : `${HrmTheme.colors.tertiaryButtonColor}CC`)};
    background-blend-mode: color;
  }

  &&:focus {
    outline-style: auto;
    outline-width: initial;
  }

  &&:active {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

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

export const InformationIconButton = withStyles({
  root: {
    width: '16px',
    height: '16px',
    color: '#b4babd',
    margin: '13px 20px 0 5px',
    cursor: 'pointer',
  },
})(InfoOutlinedIcon);

export const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#717171',
    color: '#fff',
    maxWidth: 400,
    fontSize: '10pt',
    fontStyle: 'open sans semibold',
    border: '1px solid #dadde9',
  },
}))(Tooltip);

export const CasePrintViewSpinner = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
CasePrintViewSpinner.displayName = 'CasePrintViewSpinner';
