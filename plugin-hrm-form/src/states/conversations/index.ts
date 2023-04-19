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

/**
 * Currently this state is only used when the enable_aselo_messaging_ui feature flag is set.
 * Otherwise internal Twilio flex state us used along with the default twilio message UI
 */

import { createAction, createAsyncAction, createReducer } from 'redux-promise-middleware-actions';
import { Conversation } from '@twilio/conversations';
import { ConversationsState } from '@twilio/flex-ui';

export enum MessageSendStatus {
  SENDING = 'SENDING',
  NOT_SENDING = 'NOT_SENDING',
}

type ConversationsState = {
  [conversationSid: string]: {
    draftMessageText: string;
    messageSendStatus: MessageSendStatus;
  };
};

const initialState: ConversationsState = {};

const UPDATE_DRAFT_MESSAGE_TEXT_ACTION = 'UPDATE_DRAFT_MESSAGE_TEXT';

export const newUpdateDraftMessageTextAction = createAction(
  UPDATE_DRAFT_MESSAGE_TEXT_ACTION,
  (conversationSid: string, draftMessageText: string) => ({ conversationSid, draftMessageText }),
);

const SEND_MESSAGE_ACTION = 'SEND_MESSAGE_ACTION';

export const newSendMessageeAsyncAction = createAsyncAction(
  SEND_MESSAGE_ACTION,
  async (conversation: Conversation, messageText: string): Promise<{ returnStatus: number; sid: string }> => {
    const returnStatus = await conversation.sendMessage(messageText);
    return { returnStatus, sid: conversation.sid };
  },
  (conversation: Conversation, messageText: string) => ({ conversation, messageText }),
);

export const reduce = createReducer(initialState, handleAction => [
  handleAction(newUpdateDraftMessageTextAction, (state, action) => {
    return {
      ...state,
      [action.payload.conversationSid]: {
        draftMessageText: action.payload.draftMessageText,
        messageSendStatus: MessageSendStatus.NOT_SENDING,
      },
    };
  }),
  handleAction(newSendMessageeAsyncAction.pending as typeof newSendMessageeAsyncAction, (state, action) => {
    return {
      ...state,
      [action.meta.conversation.sid]: {
        draftMessageText: action.meta.messageText,
        messageSendStatus: MessageSendStatus.SENDING,
      },
    };
  }),
  handleAction(newSendMessageeAsyncAction.fulfilled, (state, action) => {
    return {
      ...state,
      [action.payload.sid]: {
        draftMessageText: '',
        messageSendStatus: MessageSendStatus.NOT_SENDING,
      },
    };
  }),
  handleAction(newSendMessageeAsyncAction.rejected, (state, action) => {
    const meta = (action as any).meta as ReturnType<typeof newSendMessageeAsyncAction>['meta'];
    return {
      ...state,
      [meta.conversation.sid]: {
        draftMessageText: '',
        messageSendStatus: MessageSendStatus.NOT_SENDING,
      },
    };
  }),
]);
