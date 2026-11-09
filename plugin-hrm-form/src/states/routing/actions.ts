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

import { AppRoutes, CHANGE_ROUTE, ChangeRouteMode, CLOSE_MODAL, GO_BACK, OPEN_MODAL, RoutingActionType } from './types';

// Action creators
export const changeRoute = (
  routing: AppRoutes,
  taskId: string,
  mode: ChangeRouteMode = ChangeRouteMode.Push,
): RoutingActionType => ({
  type: CHANGE_ROUTE,
  routing,
  taskId,
  mode,
});

export const newOpenModalAction = (routing: AppRoutes, taskId: string): RoutingActionType => ({
  type: OPEN_MODAL,
  routing,
  taskId,
});

/**
 * Close modal action
 * @param taskId
 * @param topRoute - if this is specified, all modals on top the lowest modal with this route (or the base route, if it matches) will be closed, otherwise just the top modal will be closed
 */
export const newCloseModalAction = (taskId: string, topRoute?: AppRoutes['route']): RoutingActionType => ({
  type: CLOSE_MODAL,
  taskId,
  topRoute,
});

export const newGoBackAction = (taskId: string): RoutingActionType => {
  return {
    type: GO_BACK,
    taskId,
  };
};
