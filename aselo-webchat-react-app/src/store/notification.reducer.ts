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

import { AnyAction, Reducer } from "redux";

import { NotificationState } from "./definitions";
import { ACTION_ADD_NOTIFICATION, ACTION_REMOVE_NOTIFICATION } from "./actions/actionTypes";

const initialState: NotificationState = [];

export const NotificationReducer: Reducer = (
    state: NotificationState = initialState,
    action: AnyAction
): NotificationState => {
    switch (action.type) {
        case ACTION_ADD_NOTIFICATION:
            return [...state, action.payload.notification];
        case ACTION_REMOVE_NOTIFICATION:
            return state.filter((notification) => notification.id !== action.payload.id);
        default:
            return state;
    }
};
