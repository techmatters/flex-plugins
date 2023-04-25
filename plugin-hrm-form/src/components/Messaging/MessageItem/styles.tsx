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

import { FontOpenSans, Row } from '../../../styles/HrmStyles';
import HrmTheme from '../../../styles/HrmTheme';

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
