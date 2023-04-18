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

type ConversationsState = {
  [conversationSid: string]: {
    draftMessageText: string;
  };
};

const initState = {};

const UPDATE_DRAFT_MESSAGE_TEXT_ACTION = 'UPDATE_DRAFT_MESSAGE_TEXT';

type UpdateDraftMessageTextAction = {
  type: typeof UPDATE_DRAFT_MESSAGE_TEXT_ACTION;
  payload: {
    conversationSid: string;
    draftMessageText: string;
  };
};

export const newUpdateDraftMessageTextAction = (conversationSid: string, draftMessageText: string) => ({
  type: UPDATE_DRAFT_MESSAGE_TEXT_ACTION,
  payload: { conversationSid, draftMessageText },
});

type TextMessagingActionTypes = UpdateDraftMessageTextAction;

export const reduce = (state: ConversationsState = initState, action: TextMessagingActionTypes): ConversationsState => {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (action.type) {
    case UPDATE_DRAFT_MESSAGE_TEXT_ACTION:
      return {
        ...state,
        [action.payload.conversationSid]: {
          ...state[action.payload.conversationSid],
          draftMessageText: action.payload.draftMessageText,
        },
      };
    default:
      return state;
  }
};
