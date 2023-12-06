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
import { useSelector } from 'react-redux';

import { RouterTask } from '../../../types/types';
import { RootState } from '../..';
import { selectRoutingStateByTaskId } from '../selectors';
import getTaskSidFromTask from './getTaskSidFromTask';

/**
 * This hook provides access to the base path for a given task.
 *
 * @param task
 * @returns string
 */
export const useTaskRouterBasePath = (task: RouterTask) => {
  const taskSid = getTaskSidFromTask(task);
  return useSelector((state: RootState) => selectRoutingStateByTaskId(state, taskSid))?.basePath;
};

export default useTaskRouterBasePath;
