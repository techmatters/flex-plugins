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

import { Conversation, Message } from "@twilio/conversations";
import { Dispatch } from "redux";

import { ACTION_ADD_MESSAGE, ACTION_REMOVE_MESSAGE, ACTION_UPDATE_MESSAGE } from "../actionTypes";

export const initMessagesListener = (conversation: Conversation, dispatch: Dispatch) => {
    conversation.addListener("messageAdded", (message: Message) => {
        dispatch({
            type: ACTION_ADD_MESSAGE,
            payload: { message }
        });
    });
    conversation.addListener("messageRemoved", (message: Message) => {
        dispatch({
            type: ACTION_REMOVE_MESSAGE,
            payload: { message }
        });
    });
    conversation.addListener("messageUpdated", ({ message }) => {
        dispatch({
            type: ACTION_UPDATE_MESSAGE,
            payload: { message }
        });
    });
};
