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

import { Client } from "@twilio/conversations";
import { Dispatch } from "redux";

import { sessionDataHandler } from "../../../sessionDataHandler";
import { notifications } from "../../../notifications";
import { addNotification, removeNotification } from "../genericActions";
import { ACTION_UPDATE_SESSION_DATA } from "../actionTypes";

export const initClientListeners = (conversationClient: Client, dispatch: Dispatch) => {
    const tokenAboutToExpireEvent = "tokenAboutToExpire";
    const connectionStateChangedEvent = "connectionStateChanged";
    const logger = window.Twilio.getLogger("conversationClientListener");

    // remove any other refresh handler added before and add it again
    conversationClient.removeAllListeners(tokenAboutToExpireEvent);
    conversationClient.addListener(tokenAboutToExpireEvent, async () => {
        logger.warn("token about to expire");

        const data = await sessionDataHandler.getUpdatedToken();
        if (data?.token && data?.conversationSid) {
            await conversationClient.updateToken(data.token);
            dispatch({
                type: ACTION_UPDATE_SESSION_DATA,
                payload: {
                    token: data.token,
                    conversationSid: data.conversationSid,
                },
            });
        }
    });

    conversationClient.removeAllListeners(connectionStateChangedEvent);
    conversationClient.addListener(connectionStateChangedEvent, (connectionStatus: string) => {
        if (connectionStatus === "connected") {
            dispatch(removeNotification(notifications.noConnectionNotification().id));
        } else if (connectionStatus === "connecting") {
            dispatch(addNotification(notifications.noConnectionNotification()));
        }
    });
};
