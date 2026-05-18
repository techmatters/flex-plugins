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

/* eslint-disable import/no-unused-modules */
import React from 'react';
import { styled } from '@twilio/flex-ui';

const HrmTheme = {
  button: {
    color: {
      default: {
        primary: '#FFFFFF',
        secondary: '#192B33',
        destructive: '#FFFFFF',
      },
      hover: {
        primary: '#FFFFFF',
        secondary: '#192B33',
        destructive: '#FFFFFF',
      },
      active: {
        primary: '#FFFFFF',
        secondary: '#192B33',
        destructive: '#FFFFFF',
      },
      disabled: {
        primary: '#FFFFFF',
        secondary: '#B4B9BB',
        destructive: '#FFFFFF',
      },
    },
    backgroundColor: {
      default: {
        primary: '#192B33',
        secondary: '#ECEDF1',
        destructive: '#D61F1F',
      },
      hover: {
        primary: '#2A4551',
        secondary: '#DADBE2',
        destructive: '#B41C1C',
      },
      active: {
        primary: '#6E828B',
        secondary: '#B5B7BF',
        destructive: '#4A0B0B',
      },
      disabled: {
        primary: '#BABFC2',
        secondary: '#F6F6F6',
        destructive: '#F3BCBC',
      },
    },
    padding: {
      small: '10px 14px',
      medium: '12px 20px',
      large: '13px 28px',
    },
    fontSize: {
      small: '13px',
      medium: '14px',
      large: '16px',
    },
  },
};

type Props = {
  variant: 'primary' | 'secondary' | 'destructive';
  size: 'small' | 'medium' | 'large';
  disabled: boolean;
};

type ButtonState = 'default' | 'hover' | 'active' | 'disabled';

const getColorProperty = (property: 'color' | 'backgroundColor', props: Props, state: ButtonState) => {
  const { variant, disabled } = props;
  return HrmTheme.button[property][disabled ? 'disabled' : state][variant];
};

const getSizeProperty = (property: 'height' | 'fontSize' | 'padding', props: Props) => {
  const { size } = props;
  return HrmTheme.button[property][size];
};

const getColor = (props: Props, state: ButtonState = 'default') => getColorProperty('color', props, state);
const getBackgroundColor = (props: Props, state: ButtonState = 'default') =>
  getColorProperty('backgroundColor', props, state);
const getFontSize = (props: Props) => getSizeProperty('fontSize', props);
const getPadding = (props: Props) => getSizeProperty('padding', props);

export const StyledButton = styled('button')<Props>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => getFontSize(props)};
  letter-spacing: normal;
  color: ${props => getColor(props)};
  background-color: ${props => getBackgroundColor(props)};
  border: none;
  border-radius: 4px;
  padding: ${props => getPadding(props)};
  min-width: auto;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  &&:hover {
    background-color: ${props => getBackgroundColor(props, 'hover')};
  }
  &&:active {
    background-color: ${props => getBackgroundColor(props, 'active')};
  }
  &&:focus-visible {
    outline-style: auto;
    outline-width: initial;
  }
`;
