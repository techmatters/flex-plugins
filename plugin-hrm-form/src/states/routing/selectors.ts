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

import { namespace } from '../storeNamespaces';
import { AppRoutes, isRouteWithModalSupport, RoutingState } from './types';
import { RootState } from '..';

const getCurrentTopmostRouteStack = (baseRouteStack: AppRoutes[]): AppRoutes[] | undefined => {
  if (baseRouteStack?.length) {
    const currentRoute = baseRouteStack[baseRouteStack.length - 1];
    if (isRouteWithModalSupport(currentRoute) && currentRoute.activeModal) {
      return getCurrentTopmostRouteStack(currentRoute.activeModal);
    }
  }
  return baseRouteStack;
};

export const selectRoutingState = (state: RootState): RoutingState => state[namespace].routing;

export const selectBaseForTask = (state: RootState, taskSid: string): AppRoutes[] | undefined =>
  selectRoutingState(state).tasks[taskSid];

export const selectCurrentTopmostRouteStackForTask = (state: RootState, taskSid: string): AppRoutes[] =>
  getCurrentTopmostRouteStack(selectRoutingState(state).tasks[taskSid]);

export const selectCurrentTopmostRouteForTask = (state: RootState, taskSid: string): AppRoutes | undefined => {
  const topStack = selectCurrentTopmostRouteStackForTask(state, taskSid);
  return topStack.length ? topStack[topStack.length - 1] : undefined;
};

export const selectCurrentBaseRoute = (state: RootState, taskSid: string): AppRoutes | undefined => {
  const baseRouteStack = selectBaseForTask(state, taskSid);
  return baseRouteStack?.length ? baseRouteStack[baseRouteStack.length - 1] : undefined;
};
