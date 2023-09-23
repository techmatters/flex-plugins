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
import { ViewportList } from 'react-viewport-list';
import format from 'date-fns/format';

import { GroupedMessage, MessageItem } from '../MessageItem';
import { DateRulerContainer, DateRulerDateText, DateRulerHr, MessageListContainer } from './styles';

type GroupedMessagesByDate = { [dateKey: string]: GroupedMessage[] };

type Props = {
  messages: GroupedMessage[];
};

type DateDividerItem = {
  dateText: string;
};

const isItemDateDivider = (item: GroupedMessage | DateDividerItem): item is DateDividerItem => {
  return Boolean((item as DateDividerItem).dateText);
};

const flattenGroupedMessages = (groupedMessages: GroupedMessagesByDate): (GroupedMessage | DateDividerItem)[] =>
  Object.entries(groupedMessages).flatMap(([dateKey, ms]) => {
    const dateRuler = {
      dateText: dateKey,
    };

    return [dateRuler, ...ms];
  });

const groupMessagesByDate = (accum: GroupedMessagesByDate, m: GroupedMessage): GroupedMessagesByDate => {
  const dateKey = format(new Date(m.dateCreated), 'yyyy/MM/dd');

  if (!accum[dateKey]) {
    return { ...accum, [dateKey]: [m] };
  }

  return { ...accum, [dateKey]: [...accum[dateKey], m] };
};

const groupMessages = (messages: GroupedMessage[]): GroupedMessagesByDate => messages.reduce(groupMessagesByDate, {});

const MessageList: React.FC<Props> = ({ messages }) => {
  const messagesToRender = React.useMemo(() => flattenGroupedMessages(groupMessages(messages)), [messages]);
  const ref = React.useRef(null);
  let dividerCounter = 0;
  return (
    <MessageListContainer ref={ref}>
      <ViewportList viewportRef={ref} items={messagesToRender}>
        {item => {
          return isItemDateDivider(item) ? (
            // eslint-disable-next-line no-plusplus
            <DateRulerContainer key={`divider_${dividerCounter++}`}>
              <DateRulerHr />
              <DateRulerDateText>{item.dateText}</DateRulerDateText>
              <DateRulerHr />
            </DateRulerContainer>
          ) : (
            <MessageItem key={item.sid} message={item} />
          );
        }}
      </ViewportList>
    </MessageListContainer>
  );
};
MessageList.displayName = 'MessageList';

export default MessageList;
