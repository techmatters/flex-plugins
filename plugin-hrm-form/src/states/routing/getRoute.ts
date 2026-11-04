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

import { ITask } from '@twilio/flex-ui';

import { AppRoutes, isRouteWithModalSupport, RoutingState } from './types';
import { RootState } from '..';
import { namespace } from '../storeNamespaces';
import { standaloneTaskSid } from '../../types/types';

const getCurrentTopmostRouteStack = (baseRouteStack: AppRoutes[]): AppRoutes[] | undefined => {
  if (baseRouteStack?.length) {
    const currentRoute = baseRouteStack[baseRouteStack.length - 1];
    if (isRouteWithModalSupport(currentRoute) && currentRoute.activeModal) {
      return getCurrentTopmostRouteStack(currentRoute.activeModal);
    }
  }
  return baseRouteStack;
};

export const getCurrentTopmostRouteStackForTask = (state: RoutingState, taskSid: string): AppRoutes[] =>
  getCurrentTopmostRouteStack(state.tasks[taskSid]?.routeStack);

export const getCurrentTopmostRouteForTask = (state: RoutingState, taskSid: string): AppRoutes | undefined => {
  const topStack = getCurrentTopmostRouteStack(state.tasks[taskSid]?.routeStack);
  return topStack?.length ? topStack[topStack.length - 1] : undefined;
};

export const selectCurrentTopmostRouteForTask = (state: RootState, taskSid: string): AppRoutes | undefined =>
  getCurrentTopmostRouteForTask(state[namespace].routing, taskSid);

export const getCurrentBaseRoute = (state: RoutingState, taskSid: string): AppRoutes | undefined => {
  const baseRouteStack = state.tasks[taskSid]?.routeStack;
  return baseRouteStack?.length ? baseRouteStack[baseRouteStack.length - 1] : undefined;
};

export const selectCurrentBaseRoute = (
  { [namespace]: { routing } }: RootState,
  taskSid: string,
): AppRoutes | undefined => getCurrentBaseRoute(routing, taskSid);

/**
 * The queue greeting popover of a task is open while the counsellor is on the agent desktop with that task selected,
 * unless they have dismissed it
 */
export const selectIsQueueGreetingOpen = (state: RootState, task: Pick<ITask, 'sid' | 'taskSid'>): boolean => {
  const isOnAgentDesktop =
    (selectCurrentTopmostRouteForTask(state, standaloneTaskSid)?.route as string) === 'agent-desktop';
  // Flex identifies the selected task by its reservation SID
  const isTaskSelected = state.flex.view.selectedTaskSid === task.sid;
  const isDismissed = Boolean(state[namespace].routing.tasks[task.taskSid]?.isQueueGreetingDismissed);
  return isOnAgentDesktop && isTaskSelected && !isDismissed;
};
