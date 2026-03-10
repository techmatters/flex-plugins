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

export const SearchIconContainer = styled('div')`
  position: absolute;
  transform: translateX(35%) translateY(30%);
  opacity: 0.4;
  z-index: 2;
`;
SearchIconContainer.displayName = 'SearchIconContainer';

// export const StyledSearchInput = styled(FormInputBase)`
export const StyledSearchInput = styled(FormInputBase)`
  position: relative;
  & {
    width: 100%;
    min-width: 217px;
    padding-left: 30px;
  }
`;
StyledSearchInput.displayName = 'FormSearchInput';
