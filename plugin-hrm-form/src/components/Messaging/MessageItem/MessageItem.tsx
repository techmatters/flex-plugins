/* eslint-disable react/jsx-max-depth */
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
  MessageItemInnerContainer,
  AvatarColumn,
  MessageBubbleTextContainer,
} from './styles';
import { TranscriptMessage } from '../../../states/contacts/existingContacts';

export type GroupedMessage = TranscriptMessage & {
  friendlyName: string;
  isCounselor: boolean;
  isGroupedWithPrevious: boolean;
};

type Props = {
  message: GroupedMessage;
};

const MessageItem: React.FC<Props> = ({ message }) => {
  const { body, dateCreated, friendlyName, from, isCounselor, isGroupedWithPrevious } = message;
  const renderIcon = !isCounselor && !isGroupedWithPrevious;
  return (
    <MessageItemContainer isCounselor={isCounselor} isGroupedWithPrevious={isGroupedWithPrevious} role="listitem">
      <MessageItemInnerContainer>
        <AvatarColumn>
          <AvatarContainer withBackground={renderIcon}>
            {renderIcon ? (
              <Icon icon="DefaultAvatar" />
            ) : (
              // Just fill in the column so divs wont float around :)
              <div style={{ height: 24, width: 24 }} />
            )}
          </AvatarContainer>
        </AvatarColumn>
        <MessageBubbleContainer isCounselor={isCounselor}>
          <MessageBubleInnerContainer isCounselor={isCounselor}>
            <MessageBubbleTextContainer>
              <MessageBubbleHeader>
                <MessageBubbleNameText isCounselor={isCounselor}>{friendlyName || from}</MessageBubbleNameText>
                <MessageBubbleDateText isCounselor={isCounselor}>
                  {format(new Date(dateCreated), 'hh:mm a')}
                </MessageBubbleDateText>
              </MessageBubbleHeader>
              <MessageBubbleBody>
                <MessageBubbleBodyText isCounselor={isCounselor}>{body}</MessageBubbleBodyText>
              </MessageBubbleBody>
            </MessageBubbleTextContainer>
          </MessageBubleInnerContainer>
        </MessageBubbleContainer>
      </MessageItemInnerContainer>
    </MessageItemContainer>
  );
};

export default MessageItem;
