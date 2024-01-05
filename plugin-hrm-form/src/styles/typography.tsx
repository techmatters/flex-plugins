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

import HrmTheme from './HrmTheme';

export const FontOpenSans = styled('p')`
  color: #000000;
  font-family: Open Sans;
  text-align: left;
`;
FontOpenSans.displayName = 'FontOpenSans';

export const Bold = styled('span')`
  font-weight: 700;
`;

Bold.displayName = 'Bold';

export const TypingIndicatorText = styled(FontOpenSans)`
  font-size: 10px;
  margin: auto 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
TypingIndicatorText.displayName = 'TypingIndicatorText';

// used for screen readers only
export const HiddenText = styled('span')`
  width: 0px;
  height: 0px;
  font-size: 0px;
  line-height: 0px;
`;
HiddenText.displayName = 'HiddenText';

// This text will not be a child element but can be used for aria-live
// where the text is read when it enters the dom
export const AriaLiveHiddenText = styled('span')`
  top: 0;
  left: -2px;
  width: 1px;
  height: 1px;
  position: absolute;
  overflow: hidden;
`;
AriaLiveHiddenText.displayName = 'AriaLiveHiddenText';

export const ErrorText = styled('p')`
  color: ${HrmTheme.colors.errorColor};
  font-size: 10px;
  line-height: 1.5;
`;
ErrorText.displayName = 'ErrorText';

export const CategorySubtitleSection = styled('div')`
  display: flex;
  align-items: center;
  margin: 6px 0;
`;
CategorySubtitleSection.displayName = 'CategorySubtitleSection';

export const CategoryRequiredText = styled('p')`
  color: ${HrmTheme.colors.darkTextColor};
  font-size: 12px;
  font-weight: 400;
  flex-grow: 1;

  &:before {
    color: ${HrmTheme.colors.errorColor};
    content: '* ';
  }
`;
CategoryRequiredText.displayName = 'CategoryRequiredText';
