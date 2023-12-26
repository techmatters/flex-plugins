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
import ChevronLeft from '@material-ui/icons/ChevronLeft';

import { FontOpenSans } from '../../styles';

type NavigableContainerProps = {
  modal?: boolean;
};

export const NavigableContainerBox = styled('div')<NavigableContainerProps>`
  display: flex;
  padding: 20px 5px 12px 5px;
  flex-direction: column;
  flex-wrap: nowrap;
  background-color: #ffffff;
  ${({ modal }) => (modal ? `border-radius: 8px;` : ``)}
  margin: ${({ modal }) => (modal ? `5px` : `0`)};
  height: 100%;
  overflow-y: hidden;
`;

NavigableContainerBox.displayName = 'NavigableContainerBox';

export const NavigableContainerContentBox = styled('div')<NavigableContainerProps>`
  padding: 0 30px 0 30px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  height: 100%;
  overflow-y: auto;
`;

NavigableContainerContentBox.displayName = 'NavigableContainerContentBox';

export const NavigableContainerTitle = styled(FontOpenSans)`
  font-size: 14pt;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 20px;
  margin-top: 12px;
`;

NavigableContainerTitle.displayName = 'NavigableContainerTitle';
export const LargeBackIcon = styled(ChevronLeft)`
  color: #000000;
  font-size: 1.5rem !important; // FU material
`;
