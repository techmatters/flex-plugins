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
  TEAMSVIEW_SELECT_WORKERS,
  TEAMSVIEW_UNSELECT_WORKERS,
  TeamsViewSelectWorkersAction,
  TeamsViewUnselectWorkersAction,
} from './types';

export const teamsViewSelectWorkers = (workers: string[]): TeamsViewSelectWorkersAction => ({
  type: TEAMSVIEW_SELECT_WORKERS,
  payload: workers,
});

export const teamsViewUnselectWorkers = (workers: string[]): TeamsViewUnselectWorkersAction => ({
  type: TEAMSVIEW_UNSELECT_WORKERS,
  payload: workers,
});
