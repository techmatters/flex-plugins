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

import HrmTheme from '../../styles/HrmTheme';

export const MultiSelectSearchInput = styled('input')`
  margin-bottom: 15px;
  display: flex;
  flex-grow: 0;
  font-family: Open Sans;
  font-size: 13px;
  line-height: 1.33;
  letter-spacing: normal;
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  background-color: ${HrmTheme.colors.inputBackgroundColor};
  color: #192b33;
  box-shadow: none;
  padding: 0 34px;
  border: none;

  &:focus {
    background-color: ${HrmTheme.colors.inputBackgroundColor};
    box-shadow: none;
    border: 1px solid rgba(0, 59, 129, 0.37);
  }
`;
MultiSelectSearchInput.displayName = 'MultiSelectSearchInput';
