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

import { FontOpenSans } from '../../styles/HrmStyles';

type PaginationRowProps = {
  transparent?: boolean;
};

export const PaginationRow = styled('nav')<PaginationRowProps>`
  display: flex;
  justify-content: center;
  background-color: transparent;
  padding: 40px auto;
  margin: 40px auto;
`;
PaginationRow.displayName = 'PaginationRow';

type PaginationButtonProps = {
  highlight?: Boolean;
};

export const PaginationButton = styled('button')<PaginationButtonProps>`
  background-color: ${props => (props.highlight ? '#1976D2' : 'transparent')};
  box-shadow: ${props => (props.highlight ? '0 1px 1px 0 rgba(0, 0, 0, 0.06)' : '0')};
  border-radius: 4px;
  padding: 6px 10px;
  margin: 0 2px;
  border: none;
  &:focus {
    outline: auto;
  }
`;
PaginationButton.displayName = 'PaginationButton';

export const PaginationChevron = styled(PaginationButton)`
  margin: 0;
  padding: 7px 3px;
`;
PaginationChevron.displayName = 'PaginationChevron';

type PaginationButtonTextProps = {
  highlight?: Boolean;
};

export const PaginationButtonText = styled(FontOpenSans)<PaginationButtonTextProps>`
  font-size: 13px;
  color: ${props => (props.highlight ? '#ffffff' : '#666c7c')};
  font-weight: ${props => (props.highlight ? 700 : 600)};
`;
PaginationButtonText.displayName = 'PaginationButtonText';
