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

// Switchboard State
export type SwitchboardState = {
  isSwitchboardingActive: boolean;
  queueSid: string | null;
  queueName: string | null;
  startTime: string | null;
  supervisorWorkerSid: string | null;
  isLoading: boolean;
  error: string | null;
};

// Initial state
export const initialState: SwitchboardState = {
  isSwitchboardingActive: false,
  queueSid: null,
  queueName: null,
  startTime: null,
  supervisorWorkerSid: null,
  isLoading: false,
  error: null,
};

// Action types
export const SWITCHBOARD_STATE_UPDATE = 'SWITCHBOARD_STATE_UPDATE';
export const SWITCHBOARD_SET_LOADING = 'SWITCHBOARD_SET_LOADING';
export const SWITCHBOARD_SET_ERROR = 'SWITCHBOARD_SET_ERROR';

export type SwitchboardStateUpdateAction = {
  type: typeof SWITCHBOARD_STATE_UPDATE;
  payload: Omit<SwitchboardState, 'isLoading' | 'error'>;
};

export type SwitchboardSetLoadingAction = {
  type: typeof SWITCHBOARD_SET_LOADING;
  payload: boolean;
};

export type SwitchboardSetErrorAction = {
  type: typeof SWITCHBOARD_SET_ERROR;
  payload: string | null;
};

export type SwitchboardActionTypes =
  | SwitchboardStateUpdateAction
  | SwitchboardSetLoadingAction
  | SwitchboardSetErrorAction;
