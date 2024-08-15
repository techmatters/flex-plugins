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

import { FontOpenSans } from '../../../styles';
import HrmTheme from '../../../styles/HrmTheme';

export const MessageItemContainer = styled('div')<{ isCounselor: boolean; isGroupedWithPrevious: boolean }>`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  overflow: visible;
  min-width: 0px;
  margin-top: ${({ isGroupedWithPrevious }) => (isGroupedWithPrevious ? '0.25rem' : '1.25rem')};
`;
MessageItemContainer.displayName = 'MessageItemContainer';

const FlexGrowShrink = styled('div')`
  display: flex;
  -webkit-box-flex: 1;
  flex-grow: 1;
  flex-shrink: 1;
`;

export const MessageItemInnerContainer = styled(FlexGrowShrink)`
  flex-flow: row nowrap;
`;

type MessageBubbleProps = {
  isCounselor: boolean;
};

export const MessageBubbleContainer = styled('div')<MessageBubbleProps>`
  display: flex;
  flex-direction: column;
  max-width: 432px;
  min-width: 100px;
  ${p => !p.isCounselor && 'margin-right: 44px;'}
  ${p => p.isCounselor && 'margin-left: auto;'}
  box-sizing: borber-box;
`;
MessageBubbleContainer.displayName = 'MessageBubbleContainer';

export const MessageBubleInnerContainer = styled(FlexGrowShrink)<MessageBubbleProps>`
  flex-flow: column nowrap;
  overflow-x: hidden;
  background-color: ${props => (props.isCounselor ? '#030B5D' : HrmTheme.colors.base2)};
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: none;
  margin-left: ${p => (p.isCounselor ? '44px' : '0px')};
`;
MessageBubleInnerContainer.displayName = 'MessageBubleInnerContainer';

export const MessageBubbleTextContainer = styled(FlexGrowShrink)`
  flex-flow: column nowrap;
  overflow: visible;
`;
MessageBubbleTextContainer.displayName = 'MessageBubbleTextContainer';

export const MessageBubbleHeader = styled(FlexGrowShrink)`
  flex-flow: row nowrap;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
`;
MessageBubbleHeader.displayName = 'MessageBubbleHeader';

export const MessageBubbleNameText = styled('div')<{ isCounselor: boolean }>`
  font-family: Open Sans;
  text-align: left;
  color: ${({ isCounselor }) => (isCounselor ? '#FFFFFF' : '#121C2D')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 0 1 auto;
  margin-right: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
`;

export const MessageBubbleDateText = styled('div')<{ isCounselor: boolean }>`
  font-family: Open Sans;
  text-align: left;
  color: ${({ isCounselor }) => (isCounselor ? '#FFFFFF' : '#121C2D')};
  font-size: 0.75rem;
  white-space: nowrap;
  flex: 0 0 auto;
`;
MessageBubbleDateText.displayName = 'MessageBubbleDateText';

export const MessageBubbleBody = styled('div')`
  display: flex;
  margin-top: 0.25rem;
  margin-bottom: 0px;
  overflow-y: hidden;
  overflow-wrap: break-word;
  font-size: 0.875rem;
  line-height: 1.25rem;
`;
MessageBubbleBody.displayName = 'MessageBubbleBody';

export const MessageBubbleBodyText = styled(FontOpenSans)<{ isCounselor: boolean }>`
  font-size: 14px;
  line-height: 1.54;
  white-space: break-spaces;
  overflow-wrap: anywhere;
  color: ${({ isCounselor }) => (isCounselor ? '#FFFFFF' : '#222222')};
`;
MessageBubbleBodyText.displayName = 'MessageBubbleBodyText';

export const AvatarColumn = styled(FlexGrowShrink)`
  flex-flow: row nowrap;
  -webkit-box-flex: 0;
  flex-grow: 0;
`;
AvatarColumn.displayName = 'AvatarColumn';

export const AvatarContainer = styled('div')<{ withBackground: boolean }>`
  display: flex;
  margin-right: 0.5rem;
  width: 24px;
  height: 24px;
  border-radius: 18px;
  background: ${props => (props.withBackground ? HrmTheme.colors.base2 : 'transparent')};
  overflow: hidden;
  justify-content: center;
  align-self: end;
  -webkit-box-pack: center;
`;
AvatarContainer.displayName = 'AvatarContainer';

export const MediaItemContainer = styled('p')`
  display: flex;
  align-items: center;
  border: 1px solid #8891aa;
  outline: none;
  cursor: pointer;
  width: 250px;
  max-width: calc(100% - 0.5rem);
  padding: 0px;
  overflow: hidden;
  margin-top: 0.5rem;
  border-radius: 4px;
  font-size: 10px;
  position: relative;
`;
MediaItemContainer.displayName = 'MediaItemContainer';

export const OpenMediaIconContainer = styled('p')`
  position: absolute;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
`;
OpenMediaIconContainer.displayName = 'OpenMediaIconContainer';
