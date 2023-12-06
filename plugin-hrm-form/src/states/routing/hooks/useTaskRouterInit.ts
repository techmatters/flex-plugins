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
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RouterTask } from '../../../types/types';
import { TASK_ROUTER_INIT, TASK_ROUTE_REPLACE } from '../types';
import { useTaskRouterBasePath } from './useTaskRouterBasePath';
import getTaskSidFromTask from './getTaskSidFromTask';
import { standardizeLocation } from './useRoutingLocation';

export type GetBasePath = (params: { task?: RouterTask; taskSid?: string }) => string;

export const useTaskRouterInit = (task: RouterTask, getBasePath: GetBasePath) => {
  const dispatch = useDispatch();
  const basePath = useTaskRouterBasePath(task);
  const history = useHistory();
  const taskSid = getTaskSidFromTask(task);
  const { location } = history;
  const newBasePath = getBasePath({ task, taskSid });

  /**
   * This effect initializes the routing state for the current task.
   */
  useEffect(() => {
    // Wait until we have a taskSid before initializing and don't run if we already have a basePath
    if (!taskSid || basePath) return;

    dispatch({
      type: TASK_ROUTER_INIT,
      payload: {
        taskSid,
        basePath: newBasePath,
        location: standardizeLocation(location),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, taskSid]);

  /**
   * This effect sets up a listener on the history object so we can dispatch
   * updates to the current route whenever navigation happens.
   */
  useEffect(() => {
    // We *really* don't want to add multiple listeners for the same task router
    if (!taskSid || !basePath) return;

    const unregister = history.listen((location, action) => {
      // Ignore navigate away from page events
      if (!location.pathname.startsWith(basePath)) return;

      console.log('>>> history.listen', { location, action, basePath, taskSid });

      // We only care about replacing the top of the task route stack unless a user has specifically pushed
      // a new route onto the stack or popped a route off the stack.
      dispatch({ type: TASK_ROUTE_REPLACE, payload: { taskSid, location: standardizeLocation(location) } });
    });
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, taskSid]);
};

export default useTaskRouterInit;
