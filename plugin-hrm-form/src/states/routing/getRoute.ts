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

import { AppRoutes, isRouteWithModalSupport, RoutingState } from './types';

const getCurrentTopmostRoute = (baseRouteStack: AppRoutes[]): AppRoutes | undefined => {
  if (baseRouteStack?.length) {
    const currentRoute = baseRouteStack[baseRouteStack.length - 1];
    if (isRouteWithModalSupport(currentRoute) && currentRoute.activeModal) {
      return getCurrentTopmostRoute(currentRoute.activeModal);
    }
    return currentRoute;
  }
  return undefined;
};

export const getCurrentTopmostRouteForTask = (state: RoutingState, taskSid: string): AppRoutes | undefined =>
  getCurrentTopmostRoute(state.tasks[taskSid]);

export const getCurrentBaseRoute = (state: RoutingState, taskSid: string): AppRoutes | undefined => {
  const baseRouteStack = state.tasks[taskSid];
  return baseRouteStack?.length ? baseRouteStack[baseRouteStack.length - 1] : undefined;
};
