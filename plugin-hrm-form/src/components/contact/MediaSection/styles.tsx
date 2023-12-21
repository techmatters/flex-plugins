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

import { sectionTitleFontStyle } from '../../search/styles';
import { FontOpenSans } from '../../../styles';
import HrmTheme from '../../../styles/HrmTheme';

export const ErrorFont = styled(FontOpenSans)`
  font-size: 12px;
  font-style: italic;
  line-height: 17px;
`;

export const ItalicFont = styled(FontOpenSans)`
  font-size: 12px;
  font-style: italic;
  line-height: 17px;
`;
ItalicFont.displayName = 'ItalicFont';

export const LoadMediaButton = styled('button')`
  height: 28px;
  width: 30%;
  background-color: ${props => (HrmTheme.colors as any).secondaryButtonColor};
  border-radius: 4px;
  border-style: none;
`;

export const LoadMediaButtonText = styled(FontOpenSans)`
  ${sectionTitleFontStyle};
  text-align: center;
`;
LoadMediaButtonText.displayName = 'LoadMediaButtonText';
