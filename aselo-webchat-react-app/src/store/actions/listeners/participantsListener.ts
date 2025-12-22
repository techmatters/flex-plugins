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

import { Conversation, Participant } from "@twilio/conversations";
import { Dispatch } from "redux";

import {
    ACTION_ADD_PARTICIPANT,
    ACTION_REMOVE_PARTICIPANT,
    ACTION_UPDATE_PARTICIPANT,
    ACTION_UPDATE_PARTICIPANT_NAME
} from "../actionTypes";
import { updatePraticipants, customAgentName } from "../../../utils/participantNameMap";

export const initParticipantsListener = (conversation: Conversation, dispatch: Dispatch) => {
    conversation.addListener("participantJoined", async (participant: Participant) => {
        const user = await participant.getUser();
        dispatch({
            type: ACTION_ADD_PARTICIPANT,
            payload: { participant, user }
        });

        // set the name to empty string if we do not have a user
        const name = user ? user.friendlyName : customAgentName();

        updatePraticipants(participant, name);
        dispatch({
            type: ACTION_UPDATE_PARTICIPANT_NAME,
            payload: { participantSid: participant.sid, name }
        });
    });

    conversation.addListener("participantLeft", (participant: Participant) => {
        dispatch({
            type: ACTION_REMOVE_PARTICIPANT,
            payload: { participant }
        });
    });

    const dispatchParticipantUpdate = (participant: Participant) => {
        dispatch({
            type: ACTION_UPDATE_PARTICIPANT,
            payload: { participant }
        });
    };
    conversation.addListener("participantUpdated", ({ participant }) => dispatchParticipantUpdate(participant));
    conversation.addListener("typingStarted", dispatchParticipantUpdate);
    conversation.addListener("typingEnded", dispatchParticipantUpdate);
};
