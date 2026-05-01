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
  ACTION_UPDATE_RECAPTCHA_VALIDITY,
  ACTION_SET_OPERATING_HOURS_MESSAGE,
} from './actions/actionTypes';
import type { AppState } from './store';
import { validateInput } from '../components/forms/formInputs/validation';

const initialState: SessionState = {
  currentPhase: EngagementPhase.Loading,
  expanded: false,
  preEngagementData: {},
  recaptchaValid: false,
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

    case ACTION_UPDATE_RECAPTCHA_VALIDITY: {
      return {
        ...state,
        recaptchaValid: action.payload.recaptchaValid,
      };
    }

    case ACTION_SET_OPERATING_HOURS_MESSAGE: {
      return {
        ...state,
        operatingHoursMessage: action.payload.operatingHoursMessage,
      };
    }

    default:
      return state;
  }
};

export const selectToken = (state: AppState) => state.session.token;
export const selectPreEngagementData = (state: AppState) => state.session?.preEngagementData ?? {};
export const selectPreEngagementDataValid = (state: AppState) => {
  const definition = state.config.preEngagementFormDefinition?.fields || [];
  const preEngagementData = selectPreEngagementData(state);
  for (const def of definition) {
    const item = preEngagementData[def.name];
    if (validateInput({ definition: def, value: item?.value })) {
      return false;
    }
  }

  return true;
};

export const selectRecaptchaValid = (state: AppState) =>
  Boolean(!state.config.enableRecaptcha || state.session?.recaptchaValid);
