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

import { AppState, ConfigState } from './definitions';
import { ACTION_CHANGE_LOCALE, ACTION_LOAD_CONFIG } from './actions/actionTypes';

const initialState: ConfigState = {
  defaultLocale: 'xx-XX',
  translations: {},
  aseloBackendUrl: '',
  helplineCode: '',
  deploymentKey: '',
  quickExitUrl: 'https://www.google.com',
};

export const ConfigReducer: Reducer = (state: ConfigState = initialState, action: AnyAction): ConfigState => {
  switch (action.type) {
    case ACTION_LOAD_CONFIG: {
      return {
        ...state,
        ...action.payload,
      };
    }
    case ACTION_CHANGE_LOCALE: {
      return {
        ...state,
        currentLocale: action.payload.currentLocale,
      };
    }
    default:
      return state;
  }
};

export const selectConfig = (root: AppState): ConfigState => root.config;
export const selectCurrentLocale = (state: AppState) => state.config.currentLocale || state.config.defaultLocale;
export const selectCurrentTranslations = (state: AppState) => state.config.translations[selectCurrentLocale(state)];
