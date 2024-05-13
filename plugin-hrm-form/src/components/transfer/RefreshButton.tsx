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

/* eslint-disable react/prop-types */
import React from 'react';
import { withTaskContext, Manager, ConversationState, Actions, Template } from '@twilio/flex-ui';

import { RefreshStyledSpan, RefreshStyledButton } from '../../styles/buttons';

// Checks if there was an error while loading conversation
export const isConversationNotLoaded = conversationState => {
  const messageError = conversationState?.messages.some(item => item.error);
  const errorLoadingConversations = conversationState.errorWhileLoadingConversation || messageError;
  const messagesAndParticapantStateEmpty =
    conversationState?.messages.length === 0 && conversationState?.participants.size === 0;

  return Boolean(messagesAndParticapantStateEmpty || errorLoadingConversations);
};

const RefreshButton: React.FC<TaskContextProps> = ({ task }) => {
  if (!task) {
    return null;
  }

  const manager = Manager.getInstance();
  const conversationSid = task.attributes.channelSid;
  const conversationState = manager.store.getState().flex.chat.conversations[conversationSid];

  const reInitConversation = () => {
    const conversationNotLoaded = isConversationNotLoaded(conversationState);
    if (conversationNotLoaded) {
      ConversationState.Actions.initWithConversationSid(conversationSid);
    }
  };

  return (
    <RefreshStyledSpan>
      <Template code="Transfer-ErrorLoadingMessages" />
      <RefreshStyledButton onClick={() => Actions.addListener('afterSelectTask', reInitConversation)}>
        <Template code="Transfer-RefreshButton" />
      </RefreshStyledButton>
    </RefreshStyledSpan>
  );
};

RefreshButton.displayName = 'RefreshButton';

export default withTaskContext(RefreshButton);
