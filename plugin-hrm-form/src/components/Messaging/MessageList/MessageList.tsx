import React from 'react';
import { ViewportList } from 'react-viewport-list';
import format from 'date-fns/format';

import { GroupedMessage, MessageItem } from '../MessageItem';
import { DateRulerContainer, DateRulerDateText, DateRulerHr, MessageListContainer } from './styles';

type GroupedMessagesByDate = { [dateKey: string]: GroupedMessage[] };

type Props = {
  messages: GroupedMessage[];
};

const renderGroupedMessages = (groupedMessages: GroupedMessagesByDate) =>
  Object.entries(groupedMessages).flatMap(([dateKey, ms]) => {
    const dateRuler = (
      <DateRulerContainer>
        <DateRulerHr />
        <DateRulerDateText>{dateKey}</DateRulerDateText>
        <DateRulerHr />
      </DateRulerContainer>
    );

    const messages = ms.map(m => <MessageItem key={m.sid} message={m} />);

    return [dateRuler, ...messages];
  });

const groupMessagesByDate = (accum: GroupedMessagesByDate, m: GroupedMessage): GroupedMessagesByDate => {
  const dateKey = format(new Date(m.dateCreated), 'yyyy/MM/dd');

  if (!accum[dateKey]) {
    return { ...accum, [dateKey]: [{ ...m }] };
  }

  return { ...accum, [dateKey]: [...accum[dateKey], m] };
};

const groupMessages = (messages: GroupedMessage[]): GroupedMessagesByDate => messages.reduce(groupMessagesByDate, {});

const MessageList: React.FC<Props> = ({ messages }) => {
  const renderedMessages = React.useMemo(() => renderGroupedMessages(groupMessages(messages)), [messages]);
  const ref = React.useRef(null);

  return (
    <MessageListContainer>
      <ViewportList ref={ref} items={renderedMessages} scrollThreshold={3} overscan={2}>
        {item => item}
      </ViewportList>
    </MessageListContainer>
  );
};
MessageList.displayName = 'MessageList';

export default MessageList;
