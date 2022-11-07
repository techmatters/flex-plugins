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
