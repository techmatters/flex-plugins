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

import { CheckboxBase } from '../styles';

export const StyledMixedCheckbox = styled(CheckboxBase)`
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='false']::before {
    border-color: #d13821;
    background: #d13821;
  }
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='true']::before {
    border-color: #1976d2;
    background: #1976d2;
  }
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='false']::after {
    font-family: 'Font Awesome 5 Free';
    content: '\\f00d';
    color: #ffffff;
    font-weight: 900;
  }
  &[class~='mixed-checkbox'][type='checkbox'][aria-checked='true']::after {
    font-family: 'Font Awesome 5 Free';
    content: '\\f00c';
    color: #ffffff;
    font-weight: 900;
  }
`;
StyledMixedCheckbox.displayName = 'FormMixedCheckbox';
