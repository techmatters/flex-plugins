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
import { RouterTask } from '../../../types/types';
import useTaskRouterBasePath from './useTaskRouterBasePath';
import useTaskRouterCurrentRoute from './useTaskRouterCurrentRoute';
import getTaskSidFromTask from './getTaskSidFromTask';
import useModalRouter from './useModalRouter';
import useRoutingLocation from './useRoutingLocation';

/**
 * This hook provides access to the entire routing state for a given task.
 * It is a convenience hook that combines the other routing hooks for use
 * in root task sub-router components. It is a re-render nightmare and should
 * not be used in components that are not the root of a section.
 *
 * @param task
 * @returns
 */
export const useRoutingState = (task: RouterTask) => {
  const currentRoute = useTaskRouterCurrentRoute(task);
  const basePath = useTaskRouterBasePath(task);
  const taskSid = getTaskSidFromTask(task);
  const { activeModal } = useModalRouter(task);
  const { location, fullLocation } = useRoutingLocation();

  return {
    activeModal,
    currentRoute,
    basePath,
    taskSid,
    location,
    fullLocation,
  };
};

export default useRoutingState;
