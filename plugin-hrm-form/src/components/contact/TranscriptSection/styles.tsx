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

import { sectionTitleFontStyle } from '../../../styles/search';
import { FontOpenSans, Row } from '../../../styles/HrmStyles';
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

export const LoadTranscriptButton = styled('button')`
  height: 28px;
  width: 30%;
  background-color: ${props => (HrmTheme.colors as any).secondaryButtonColor};
  border-radius: 4px;
  border-style: none;
`;

export const LoadTranscriptButtonText = styled(FontOpenSans)`
  ${sectionTitleFontStyle};
  text-align: center;
`;
LoadTranscriptButtonText.displayName = 'LoadTranscriptButtonText';

export const MessageList = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 6px 0;
  padding: 0 3.75%;
  padding-bottom: 50px;
  width: 100%;
`;
MessageList.displayName = 'MessageList';

export const MessageItemContainer = styled(Row)<{ isCounselor: boolean; isGroupedWithPrevious: boolean }>`
  flex-wrap: nowrap;
  width: 100%;
  align-items: start;
  padding: 0 15px;
  margin-top: ${({ isGroupedWithPrevious }) => (isGroupedWithPrevious ? '4px' : '20px')};
`;
MessageItemContainer.displayName = 'MessageItemContainer';

type MessageBubbleProps = {
  isCounselor: boolean;
};

export const MessageBubbleContainer = styled(Row)<MessageBubbleProps>`
  border-radius: 4px;
  overflow: hidden;
  ${p => (p.isCounselor ? 'margin-left: auto;' : 'margin-right: auto;')}
  align-items: ${p => (p.isCounselor ? 'right' : 'left')};
  background-color: ${props => (props.isCounselor ? '#057d9e' : HrmTheme.colors.base2)};
  padding: 5px 12px 8px 12px;
`;
MessageBubbleContainer.displayName = 'MessageBubbleContainer';

export const MessageBubleInnerContainer = styled('div')`
  display: flex;
  flex-flow: column nowrap;
  flex-grow: 1;
  flex-shrink: 1;
`;
MessageBubleInnerContainer.displayName = 'MessageBubleInnerContainer';

export const MessageBubbleHeader = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
MessageBubbleHeader.displayName = 'MessageBubbleHeader';

export const MessageBubbleNameText = styled(FontOpenSans)<{ isCounselor: boolean }>`
  white-space: nowrap;
  font-size: 10px;
  font-weight: 700;
  margin-right: 8px;
  color: ${({ isCounselor }) => (isCounselor ? '#FFFFFF' : '#222222')};
`;

export const MessageBubbleDateText = styled(FontOpenSans)<{ isCounselor: boolean }>`
  white-space: nowrap;
  font-size: 10px;
  color: ${({ isCounselor }) => (isCounselor ? '#FFFFFF' : '#222222')};
`;
MessageBubbleDateText.displayName = 'MessageBubbleDateText';

export const MessageBubbleBody = styled('div')`
  display: flex;
  margin-top: 3px;
  overflow-wrap: break-word;
  max-width: 440px;
  min-width: 100px;
`;
MessageBubbleBody.displayName = 'MessageBubbleBody';

export const MessageBubbleBodyText = styled(FontOpenSans)<{ isCounselor: boolean }>`
  font-size: 12px;
  line-height: 1.54;
  overflow-wrap: break-word;
  color: ${({ isCounselor }) => (isCounselor ? '#FFFFFF' : '#222222')};
`;
MessageBubbleBodyText.displayName = 'MessageBubbleBodyText';

export const AvatarContainer = styled('div')<{ isGroupedWithPrevious: boolean }>`
  margin-right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 18px;
  background: ${props => (props.isGroupedWithPrevious ? 'transparent' : HrmTheme.colors.base2)};
`;
AvatarContainer.displayName = 'AvatarContainer';

export const DateRulerContainer = styled('div')`
  display: flex;
  flex-flow: row nowrap;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
  width: 100%;
`;
DateRulerContainer.displayName = 'DateRulerContainer';

export const DateRulerHr = styled('hr')`
  flex: 1 1 1px;
  margin: auto;
  border-color: rgb(198, 202, 215);
`;
DateRulerHr.displayName = 'DateRulerHr';

export const DateRulerDateText = styled(FontOpenSans)`
  flex: 0 1 auto;
  margin-left: 12px;
  margin-right: 12px;
  font-size: 10px;
  letter-spacing: 2px;
  color: rgb(34, 34, 34);
`;
DateRulerDateText.displayName = 'DateRulerDateText';
