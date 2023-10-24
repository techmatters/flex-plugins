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

import { AppRoutes, CHANGE_ROUTE, CLOSE_MODAL, GO_BACK, OPEN_MODAL, RoutingActionType } from './types';

// Action creators
export const changeRoute = (routing: AppRoutes, taskId: string, replace: boolean = false): RoutingActionType => ({
  type: CHANGE_ROUTE,
  routing,
  taskId,
  replace,
});

export const newOpenModalAction = (routing: AppRoutes, taskId: string): RoutingActionType => ({
  type: OPEN_MODAL,
  routing,
  taskId,
});

export const newCloseModalAction = (taskId: string): RoutingActionType => ({
  type: CLOSE_MODAL,
  taskId,
});

export const newGoBackAction = (taskId: string): RoutingActionType => ({
  type: GO_BACK,
  taskId,
});
