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

import { AnyAction } from "redux";

import { SessionReducer } from "../session.reducer";
import { EngagementPhase, SessionState, PreEngagementData } from "../definitions";
import {
    ACTION_CHANGE_ENGAGEMENT_PHASE,
    ACTION_CHANGE_EXPANDED_STATUS,
    ACTION_START_SESSION,
    ACTION_UPDATE_SESSION_DATA
} from "../actions/actionTypes";

describe("Session Reducer", () => {
    const initialPreEngagementData: PreEngagementData = {
        email: "",
        name: "",
        query: ""
    };

    const initialState: SessionState = {
        currentPhase: EngagementPhase.Loading,
        expanded: false,
        preEngagementData: initialPreEngagementData
    };

    it("should return initial state", () => {
        // @ts-expect-error This should never happen on practice
        expect(SessionReducer(undefined, {} as AnyAction)).toEqual(initialState);
    });

    it("should handle ACTION_START_SESSION action", () => {
        const token = "token";
        const conversationSid = "conversationSid";

        expect(
            SessionReducer(initialState, {
                type: ACTION_START_SESSION,
                payload: {
                    token,
                    conversationSid,
                    currentPhase: EngagementPhase.Loading
                }
            })
        ).toEqual({
            ...initialState,
            token,
            conversationSid,
            currentPhase: EngagementPhase.Loading
        });
    });

    it("should handle ACTION_UPDATE_SESSION_DATA action", () => {
        const token = "token";
        const conversationSid = "conversationSid";

        expect(
            SessionReducer(initialState, {
                type: ACTION_UPDATE_SESSION_DATA,
                payload: {
                    token,
                    conversationSid
                }
            })
        ).toEqual({
            ...initialState,
            token,
            conversationSid
        });
    });

    it("should handle ACTION_CHANGE_EXPANDED_STATUS action", () => {
        expect(
            SessionReducer(initialState, {
                type: ACTION_CHANGE_EXPANDED_STATUS,
                payload: {
                    expanded: true
                }
            })
        ).toEqual({
            ...initialState,
            expanded: true
        });
    });

    it("should handle ACTION_CHANGE_ENGAGEMENT_PHASE action", () => {
        expect(
            SessionReducer(initialState, {
                type: ACTION_CHANGE_ENGAGEMENT_PHASE,
                payload: {
                    currentPhase: EngagementPhase.PreEngagementForm
                }
            })
        ).toEqual({
            ...initialState,
            currentPhase: EngagementPhase.PreEngagementForm
        });
    });
});
