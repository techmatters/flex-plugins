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

/* eslint-disable no-nested-ternary */
import React from 'react';
import { styled } from '@twilio/flex-ui';

import { TransferStyledButton } from '../../../styles/HrmStyles';

export const PhoneNumberPopperText = styled('p')`
  font-size: 15px;
  font-weight: 700;
  margin-top: 14px;
`;
PhoneNumberPopperText.displayName = 'PhoneNumberPopperText';

export const UnmaskStyledButton = styled(TransferStyledButton)`
  padding: 0px 4px;
  background: ${props => (props.background ? props.background : '#ECEDF1')};
  &:hover:not([disabled]) {
    padding: 0 3px;
  }
`;
UnmaskStyledButton.displayName = 'UnmaskStyledButton';
