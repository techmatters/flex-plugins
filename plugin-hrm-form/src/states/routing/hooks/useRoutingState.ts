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

export const getTaskSidFromTask = (task: RouterTask): string => {
  // @ts-ignore
  return task?.sid || task?.taskSid;
};

export const useRoutingState = (task: RouterTask) => {
  /**
   * The only reason we even need routing state in redux is so that we can
   * take over where the twilio router leaves off and restore the current
   * tasks path when the user navigates away from the task and then back.
   *
   * All configuration should be part of the location or in individual state somewhere.
   */
  const taskSid = getTaskSidFromTask(task);
  const { basePath, current } = useSelector((state: RootState) => selectRoutingStateByTaskId(state, taskSid)) || {};

  return {
    basePath,
    current,
    taskSid,
  };
};

export default useRoutingState;
