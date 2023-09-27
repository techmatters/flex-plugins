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

// import { MessageBubble } from '@twilio/flex-webchat-ui';
import React from 'react';
import format from 'date-fns/esm/format';

import {
  CustomBubbleContainer,
  CustomBubbleHeader,
  CustomBubbleUserName,
  CustomBubbleTime,
  CustomBubbleBody,
} from './message-bubble-styles';

export default function Bubble(props: any) {
  const { member, message, authorName } = props;

  return (
    <CustomBubbleContainer>
      <CustomBubbleHeader style={{ color: message.isFromMe ? '#fff' : '#000' }}>
        <CustomBubbleUserName>{message.source.memberSid ? authorName : member.friendlyName}</CustomBubbleUserName>
        <CustomBubbleTime>{format(new Date(message.source.timestamp), 'h:mm a')}</CustomBubbleTime>
      </CustomBubbleHeader>
      <CustomBubbleBody>{message.source.body}</CustomBubbleBody>
    </CustomBubbleContainer>
  );
}
