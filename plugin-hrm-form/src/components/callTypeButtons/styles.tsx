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
import '@emotion/react';
import Dialog from '@material-ui/core/Dialog';
import { styled, Button } from '@twilio/flex-ui';

import HrmTheme from '../../styles/HrmTheme';

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
  white-space: normal;
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
  border: none;

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
  white-space: normal;
  width: 140px;
  min-height: 44px;
  padding: 0;
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
  border: none;
  ${props => props.marginRight && 'margin-right: 20px;'}

  &:hover {
    background-color: #b1b6c0;
  }

  &:focus {
    outline: auto;
  }
`;

export const CloseTaskDialog = styled(props => <Dialog {...props} classes={{ paper: 'paper' }} />)`
  && .paper {
    width: 360px;
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
