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

type PopupProps = {
  isOpen: boolean;
};

export const Relative = styled('div')`
  position: relative;
`;

export const Popup = styled('div')<PopupProps>`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  left: 0;
  bottom: 36px;
`;

export const SelectEmojiButton = styled('button')`
  background: none;
  border: none;
  border-radius: 50%;
  color: inherit;
  cursor: pointer;
  width: 2.25rem;
  height: 2.25rem;
  padding: 8px;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover {
    background: rgb(225, 227, 234);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    fill: currentColor;
  }
`;
