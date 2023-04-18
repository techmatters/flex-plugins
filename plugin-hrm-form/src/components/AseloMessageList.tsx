import React from 'react';
import type { MessageListChildrenProps } from '@twilio/flex-ui-core/src/components/channel/MessageList/MessageList';
import type { ConversationState } from '@twilio/flex-ui';

import { MessageList } from './Messaging/MessageList';
import type { GroupedMessage } from './Messaging/MessageItem';

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

const ReplaceMessageList: React.FC<any> = (props: MessageListChildrenProps) => {
  const { messages } = props.conversation;
  const groupedMessages = React.useMemo(() => messages.map(intoGroupedMessage), [messages]);
  return <MessageList messages={groupedMessages} />;
};
ReplaceMessageList.displayName = 'ReplaceMessageList';

export default ReplaceMessageList;
