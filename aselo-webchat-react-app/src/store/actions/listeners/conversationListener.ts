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

import { Conversation } from '@twilio/conversations';
import { Dispatch } from 'redux';

import { ACTION_UPDATE_CONVERSATION_ATTRIBUTES, ACTION_UPDATE_CONVERSATION_STATE } from '../actionTypes';

export const initConversationListener = (conversation: Conversation, dispatch: Dispatch) => {
  conversation.addListener('updated', ({ conversation: updatedConversation, updateReasons }) => {
    // we are listening only to a subset of events.
    if (updateReasons?.includes('state')) {
      dispatch({
        type: ACTION_UPDATE_CONVERSATION_STATE,
        payload: { conversationState: updatedConversation?.state?.current },
      });
    }
    if (updateReasons?.includes('attributes')) {
      dispatch({
        type: ACTION_UPDATE_CONVERSATION_ATTRIBUTES,
        payload: { conversation: updatedConversation },
      });
    }
  });
};
