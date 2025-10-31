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
import { styled } from '@twilio/flex-ui';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';

export const CloseDialogHeader = styled('p')`
  font-size: 20px;
  font-weight: 700;
  align-self: center;
  text-align: center;
`;

export const CloseDialogContent = styled('p')`
  font-size: 14px;
  margin: 20px 0;
`;

export const CloseDialogPaper = styled((props: React.JSX.IntrinsicAttributes & DialogProps) => (
  <Dialog {...props} classes={{ paper: 'paper' }} />
))`
  && .paper {
    width: 60%;
    max-width: 600px;
  }
`;
