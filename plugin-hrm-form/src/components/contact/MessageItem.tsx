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
  isCounsellor: boolean;
  isGroupedWithPrevious: boolean;
  message: TranscriptMessage;
};

const MessageItem: React.FC<Props> = ({ isCounsellor, isGroupedWithPrevious, message }) => {
  return (
    <MessageItemContainer isCounsellor={isCounsellor} isGroupedWithPrevious={isGroupedWithPrevious}>
      {!isCounsellor && (
        <AvatarContainer isGroupedWithPrevious={isGroupedWithPrevious}>
          {!isGroupedWithPrevious && <Icon icon="DefaultAvatar" />}
        </AvatarContainer>
      )}
      <MessageBubbleContainer isCounsellor={isCounsellor}>
        <MessageBubleInnerContainer>
          <MessageBubbleHeader>
            <MessageBubbleNameText isCounsellor={isCounsellor}>{message.from}</MessageBubbleNameText>
            <MessageBubbleDateText isCounsellor={isCounsellor}>
              {format(new Date(message.dateCreated), 'hh:mm a')}
            </MessageBubbleDateText>
          </MessageBubbleHeader>
          <MessageBubbleBody>
            <MessageBubbleBodyText isCounsellor={isCounsellor}>{message.body}</MessageBubbleBodyText>
          </MessageBubbleBody>
        </MessageBubleInnerContainer>
      </MessageBubbleContainer>
    </MessageItemContainer>
  );
};

export default MessageItem;
