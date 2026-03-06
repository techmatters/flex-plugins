/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Conversation } from '@twilio/conversations';

import { Header } from './Header';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { AppState } from '../store/definitions';
import { ConversationEnded } from './ConversationEnded';
import { NotificationBar } from './NotificationBar';
import { removeNotification } from '../store/actions/genericActions';
import { notifications } from '../notifications';
import { AttachFileDropArea } from './AttachFileDropArea';
import CloseChatButtons from './endChat/CloseChatButtons';

const sendInitialUserQuery = async (conv?: Conversation, query?: string): Promise<void> => {
  if (!query || !conv) return;

  const totalMessagesCount = await conv.getMessagesCount();

  if (!totalMessagesCount) {
    conv.prepareMessage().setBody(query).build().send();
  }
};

export const MessagingCanvasPhase = () => {
  const dispatch = useDispatch();

  const { conversation, conversationState, preEngagmentData } = useSelector((state: AppState) => ({
    conversationState: state.chat.conversationState,
    conversation: state.chat?.conversation,
    preEngagmentData: state.session?.preEngagementData,
  }));

  useEffect(() => {
    dispatch(removeNotification(notifications.failedToInitSessionNotification('ds').id));
    sendInitialUserQuery(conversation as Conversation, 'TODO: trigger message');
  }, [dispatch, conversation, preEngagmentData]);

  const Wrapper = conversationState === 'active' ? AttachFileDropArea : Fragment;

  return (
    <Wrapper>
      <Header />
      <CloseChatButtons />
      <NotificationBar />
      <MessageList />
      {conversationState === 'active' ? <MessageInput /> : <ConversationEnded />}
    </Wrapper>
  );
};
