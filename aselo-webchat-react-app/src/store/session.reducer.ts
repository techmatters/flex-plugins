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

import { AnyAction, Reducer } from 'redux';

import { EngagementPhase, SessionState } from './definitions';
import {
  ACTION_CHANGE_ENGAGEMENT_PHASE,
  ACTION_CHANGE_EXPANDED_STATUS,
  ACTION_START_SESSION,
  ACTION_UPDATE_SESSION_DATA,
  ACTION_UPDATE_PRE_ENGAGEMENT_DATA,
} from './actions/actionTypes';
import type { AppState } from './store';

const initialState: SessionState = {
  currentPhase: EngagementPhase.Loading,
  expanded: false,
  preEngagementData: {},
};

export const SessionReducer: Reducer<SessionState, AnyAction> = (
  state: SessionState = initialState,
  action: AnyAction,
): SessionState => {
  switch (action.type) {
    case ACTION_START_SESSION: {
      return {
        ...state,
        token: action.payload.token,
        conversationSid: action.payload.conversationSid,
        currentPhase: action.payload.currentPhase,
      };
    }

    case ACTION_UPDATE_SESSION_DATA: {
      return {
        ...state,
        token: action.payload.token,
        conversationSid: action.payload.conversationSid,
      };
    }

    case ACTION_CHANGE_EXPANDED_STATUS: {
      return {
        ...state,
        expanded: action.payload.expanded,
      };
    }

    case ACTION_CHANGE_ENGAGEMENT_PHASE: {
      return {
        ...state,
        currentPhase: action.payload.currentPhase,
      };
    }

    case ACTION_UPDATE_PRE_ENGAGEMENT_DATA: {
      return {
        ...state,
        preEngagementData: action.payload,
      };
    }

    default:
      return state;
  }
};

export const selectToken = (state: AppState) => state.session.token;
