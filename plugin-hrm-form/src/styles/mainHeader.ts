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

export const MainHeaderButton = styled('button')`
  display: flex;
  align-items: center;
  background-color: white;
  cursor: pointer;
  margin: 0 5px;
  height: 28px;
  border: 1px solid #c0c1c3;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Open Sans';
  font-weight: normal;
  color: #192b33;
  white-space: nowrap;
  &:focus {
    outline: auto;
  }
`;
MainHeaderButton.displayName = 'MultiSelectButton';

export const MainHeaderDialog = styled('div')`
  position: absolute;
  background: white;
  box-sizing: border-box;
  top: 33px;
  padding: 20px 20px 5px 20px;
  border: 1px solid lightgray;
  border-radius: 4px;
  box-shadow: 0px 0px 3px 2px rgb(0 0 0 / 10%);
  z-index: 100;
  white-space: nowrap;
`;
MainHeaderDialog.displayName = 'MainHeaderDialog';

export const MainHeaderDialogTitle = styled('h2')`
  font-family: 'Open Sans';
  font-size: 16px;
  font-weight: 800;
  color: #121c2d;
  margin-bottom: 10px;
`;

MainHeaderDialogTitle.displayName = 'MainHeaderDialogTitle';

export const MainHeaderMenuItemText = styled('h2')`
  font-family: 'Open Sans';
  font-size: 14px;
  font-weight: normal;
  color: #121c2d;
  margin-bottom: 5px;
  &:hover {
    text-decoration: underline;
  }
`;

MainHeaderMenuItemText.displayName = 'MainHeaderMenuItemText';
