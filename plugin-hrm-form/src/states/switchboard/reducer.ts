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

import { 
  SwitchboardState, 
  SwitchboardActionTypes, 
  SWITCHBOARD_STATE_UPDATE, 
  SWITCHBOARD_SET_LOADING, 
  SWITCHBOARD_SET_ERROR,
  initialState 
} from './types';

export const reduce = (state = initialState, action: SwitchboardActionTypes): SwitchboardState => {
  switch (action.type) {
    case SWITCHBOARD_STATE_UPDATE:
      return {
        ...state,
        ...action.payload
      };
    case SWITCHBOARD_SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case SWITCHBOARD_SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};
