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
import type { MessageListChildrenProps } from '@twilio/flex-ui-core/src/components/channel/MessageList/MessageList.definitions';
import { ConversationState, Template } from '@twilio/flex-ui';

import { MessageList } from '../Messaging/MessageList';
import type { GroupedMessage } from '../Messaging/MessageItem';
import { Flex, TypingIndicatorText } from '../../styles';

type ConversationStateMessage = ConversationState.ConversationState['messages'][number];

const intoGroupedMessage = (m: ConversationStateMessage): GroupedMessage => ({
  body: m.source.body,
  dateCreated: m.source.dateCreated,
  friendlyName: m.authorName,
  from: m.source.author,
  index: m.index,
  isCounselor: m.isFromMe,
  isGroupedWithPrevious: m.groupWithPrevious,
  media: m.bodyAttachment,
  sid: m.source.sid,
  type: m.source.type,
});

const getTypingIndicatorText = (typers: ConversationState.ParticipantState[]): React.ReactElement => {
  if (typers.length === 0) return null;

  const typersNames = typers.map(v => (v.source.isTyping ? v.friendlyName : ''));

  return (
    <TypingIndicatorText>
      <Template code="TypingIndicator" name={typersNames[0]} />
    </TypingIndicatorText>
  );
};

const ReplaceMessageList: React.FC<any> = (props: MessageListChildrenProps) => {
  const { messages, typers } = props.conversation;
  const groupedMessages = React.useMemo(() => messages.map(intoGroupedMessage), [messages]);

  return (
    <Flex flexDirection="column" width="100%">
      <MessageList messages={groupedMessages} />
      <div style={{ width: '100%', height: 28 }}>{getTypingIndicatorText(typers)}</div>
    </Flex>
  );
};
ReplaceMessageList.displayName = 'ReplaceMessageList';

export default ReplaceMessageList;
