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

import React from 'react';
import { Icon } from '@twilio/flex-ui';
import format from 'date-fns/format';

import {
  MessageItemContainer,
  MessageBubbleContainer,
  MessageBubbleBody,
  MessageBubbleHeader,
  AvatarContainer,
  MessageBubleInnerContainer,
  MessageBubbleNameText,
  MessageBubbleDateText,
  MessageBubbleBodyText,
} from './TranscriptSection.styles';
import { TranscriptMessage } from '../../states/contacts/existingContacts';

type Props = {
  isCounselor: boolean;
  isGroupedWithPrevious: boolean;
  message: TranscriptMessage;
};

const MessageItem: React.FC<Props> = ({ isCounselor, isGroupedWithPrevious, message }) => {
  return (
    <MessageItemContainer isCounselor={isCounselor} isGroupedWithPrevious={isGroupedWithPrevious}>
      {!isCounselor && (
        <AvatarContainer isGroupedWithPrevious={isGroupedWithPrevious}>
          {!isGroupedWithPrevious && <Icon icon="DefaultAvatar" />}
        </AvatarContainer>
      )}
      <MessageBubbleContainer isCounselor={isCounselor}>
        <MessageBubleInnerContainer>
          <MessageBubbleHeader>
            <MessageBubbleNameText isCounselor={isCounselor}>
              {message.friendlyName || message.from}
            </MessageBubbleNameText>
            <MessageBubbleDateText isCounselor={isCounselor}>
              {format(new Date(message.dateCreated), 'hh:mm a')}
            </MessageBubbleDateText>
          </MessageBubbleHeader>
          <MessageBubbleBody>
            <MessageBubbleBodyText isCounselor={isCounselor}>{message.body}</MessageBubbleBodyText>
          </MessageBubbleBody>
        </MessageBubleInnerContainer>
      </MessageBubbleContainer>
    </MessageItemContainer>
  );
};

export default MessageItem;
