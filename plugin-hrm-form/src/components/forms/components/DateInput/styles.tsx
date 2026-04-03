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

import { FormInputBase } from '../styles';

export const StyledDateInput = styled(FormInputBase)`
  & {
    display: block;
  }
  &[type='date']::-webkit-clear-button,
  &[type='date']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    display: none;
  }
  &[type='date']::placeholder {
    color: #aeaeae;
    opacity: 1;
  }
  &[type='date']::-webkit-calendar-picker-indicator {
    font-size: 20px;
    opacity: 0.8;
  }
`;
StyledDateInput.displayName = 'FormDateInput';

export const StyledTimeInput = styled(FormInputBase)`
  & {
    display: block;
  }
  &[type='time']::-webkit-datetime-edit-fields-wrapper {
    display: flex;
  }
  &[type='time']::-webkit-clear-button {
    -webkit-appearance: none;
    display: none;
  }
  &[type='time']::-webkit-calendar-picker-indicator {
    font-size: 20px;
    opacity: 0.8;
  }
`;
StyledTimeInput.displayName = 'FormTimeInput';
