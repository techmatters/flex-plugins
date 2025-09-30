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

export type TeamsViewState = {
  selectedWorkers: Set<string>;
};

export const initialState: TeamsViewState = {
  selectedWorkers: new Set(),
};

// Action types
export const TEAMSVIEW_SELECT_WORKERS = 'TEAMSVIEW_SELECT_WORKERS';
export const TEAMSVIEW_UNSELECT_WORKERS = 'TEAMSVIEW_UNSELECT_WORKERS';

export type TeamsViewSelectWorkersAction = {
  type: typeof TEAMSVIEW_SELECT_WORKERS;
  payload: string[];
};

export type TeamsViewUnselectWorkersAction = {
  type: typeof TEAMSVIEW_UNSELECT_WORKERS;
  payload: string[];
};

export type TeamsViewActionTypes = TeamsViewSelectWorkersAction | TeamsViewUnselectWorkersAction;
