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

import { Case } from '../../types/types';
import { CaseActionType, REMOVE_CONNECTED_CASE, SET_CONNECTED_CASE } from './types';

// Action creators
export const setConnectedCase = (connectedCase: Case, taskId: string): CaseActionType => ({
  type: SET_CONNECTED_CASE,
  connectedCase,
  taskId,
});

export const removeConnectedCase = (taskId: string): CaseActionType => ({
  type: REMOVE_CONNECTED_CASE,
  taskId,
});
