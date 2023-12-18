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

import { styled } from '@twilio/flex-ui';

type TransferStyledButtonProps = {
  background?: string;
  color?: string;
  taller?: boolean;
};

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
