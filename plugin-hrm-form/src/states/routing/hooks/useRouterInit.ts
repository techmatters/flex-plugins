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
import isEqual from 'lodash/isEqual';

import { RouterTask } from '../../../types/types';
import { HISTORY_INIT, HISTORY_PUSH } from '../types';
import useRoutingState from './useRoutingState';
import { standardizeLocation } from './useRoutingLocation';

export type GetBasePath = (params: { task?: RouterTask; taskSid?: string }) => string;

export const useRouterInit = (task: RouterTask, getBasePath: GetBasePath) => {
  const dispatch = useDispatch();

  const routingState = useRoutingState(task);
  const { basePath, taskSid } = routingState;
  const history = useHistory();
  const newBasePath = getBasePath({ task, taskSid });

  /**
   * This effect initializes the routing state for the current task.
   */
  useEffect(() => {
    // Wait until we have a taskSid before initializing and don't run if we already have a basePath
    if (!taskSid || basePath) return;

    dispatch({
      type: HISTORY_INIT,
      payload: {
        taskSid,
        basePath: newBasePath,
        current: standardizeLocation(location),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, taskSid]);

  /**
   * This effect sets up a listener on the history object so we can dispatch
   * updates to the current routing state when the user navigates around the
   * app.
   */
  useEffect(() => {
    // We *really* don't want to add multiple listeners for the same task router
    if (!taskSid || !basePath) return;

    const unregister = history.listen((location, action) => {
      // Ignore navigate away from page events
      if (!location.pathname.startsWith(basePath)) return;

      dispatch({ type: HISTORY_PUSH, payload: { taskSid, location: standardizeLocation(location) } });
    });
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, taskSid]);
};

export default useRouterInit;
