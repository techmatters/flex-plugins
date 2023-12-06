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
import { useDispatch, useSelector } from 'react-redux';

import { RouterTask } from '../../../types/types';
import { RootState } from '../..';
import { selectCurrentTaskRoute, selectLastTaskRoute } from '../selectors';
import { TASK_ROUTE_POP, TASK_ROUTE_PUSH, TaskRoute } from '../types';
import getTaskSidFromTask from './getTaskSidFromTask';
import FlexRouter from './flexRouter';

/**
 * This is the primary hook for interacting with the task router. It provides
 * access to the current and last route for a task as well as methods for manipulating
 * the route stack.
 *
 * @param task
 * @returns
 */
export const useTaskRouter = (task: RouterTask) => {
  const dispatch = useDispatch();
  const taskSid = getTaskSidFromTask(task);
  const lastRoute = useSelector((state: RootState) => selectLastTaskRoute(state, taskSid));
  const currentRoute = useSelector((state: RootState) => selectCurrentTaskRoute(state, taskSid));

  /**
   * Pushes a new route to the stack and navigates to it. This should be use to
   * navigate to a new primary route for the task. A primary route is one that
   * is not a modal but where we want the internal back button to work.
   *
   * @param route
   */
  const pushRoute = (route: TaskRoute) => {
    dispatch({
      type: TASK_ROUTE_PUSH,
      payload: {
        taskSid,
        route,
      },
    });
    FlexRouter.pushRoute(route);
  };

  /**
   * Replaces the current route with a new one. This should be used for any navigation
   * that does not need to be tracked in the route stack. For example, navigating to
   * new tabs, modifying searchParams, or adding a modal.
   *
   * @param route
   */
  const replaceRoute = (route: TaskRoute) => {
    // Depends on the history listener to update the current route
    FlexRouter.replaceRoute(route);
  };

  /**
   * Pops the current route off the stack and navigates to the previous route.
   */
  const popRoute = () => {
    dispatch({
      type: TASK_ROUTE_POP,
      payload: {
        taskSid,
      },
    });
    FlexRouter.pushRoute(lastRoute);
  };

  return {
    currentRoute,
    lastRoute,
    pushRoute,
    popRoute,
    replaceRoute,
  };
};

export default useTaskRouter;
