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

// Title of the page used with icon
export const Title = styled('h1')`
  font-size: 14pt;
  font-weight: 700;
  margin-bottom: 20px;
  margin-top: 12px;
  display: flex;
  align-items: center;
`;
Title.displayName = 'Title';

export const ChipBase = styled('div')`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border-radius: 6px;
  margin-right: 6px;
  padding: 5px 12px;
`;
ChipBase.displayName = 'ChipBase';

type ChipTextProps = {
  color?: string;
  bold?: boolean;
};

export const ChipText = styled(FontOpenSans)<ChipTextProps>`
  display: inline-block;
  font-size: 12px;
  font-weight: 400;
  line-height: 14px;
  opacity: 1;
  color: ${props => (props.color ? props.color : '#2f3e44')};
  font-weight: ${props => (props.bold ? 600 : 400)};
`;
ChipText.displayName = 'ChipText';

type ColorProps = {
  color?: string;
};

export const CategoryChip = styled(ChipBase)<ColorProps>`
  border-radius: 2px;
  margin-right: 6px;
  padding: 5px 12px;
  background-color: ${props => (props.color ? `${props.color}1a` : '#d8d8d8')};
`;
CategoryChip.displayName = 'CategoryChip';

type TagMiddleDotProps = {
  color?: string;
  size?: string;
};

export const TagMiddleDot = styled('div')<TagMiddleDotProps>`
  background-color: ${props => props.color};
  width: ${props => (props.size ? `${props.size}px` : '4px')};
  height: ${props => (props.size ? `${props.size}px` : '4px')};
  display: inline-block;
  min-width: 4px;
  border-radius: 100%;
  margin-right: 1ch;
`;
TagMiddleDot.displayName = 'TagMiddleDot';

export const SomethingWentWrongText = styled(FontOpenSans)`
  color: ${HrmTheme.colors.errorColor};
  font-size: 20px;
`;
SomethingWentWrongText.displayName = 'SomethingWentWrongText';

export const OpaqueText = styled('span')`
  opacity: 0.7;
  font-size: 12px;
`;
