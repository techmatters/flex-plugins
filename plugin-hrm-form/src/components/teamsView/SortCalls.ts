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

import { AgentsDataTable, TaskHelper } from '@twilio/flex-ui';
import { SupervisorWorkerState } from '@twilio/flex-ui/src/state/State.definition';

import { getAseloFeatureFlags } from '../../hrmConfig';

/**
 * Converts a duration string in the format "HH:MM:SS" or "MM:SS" to seconds.
 */
const convertDurationToSeconds = (duration: string): number => {
  const timeParts = duration.split(':').map(Number);
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (timeParts.length === 3) {
    [hours, minutes, seconds] = timeParts;
  } else if (timeParts.length === 2) {
    [minutes, seconds] = timeParts;
  }
  return hours * 60 * 60 + minutes * 60 + seconds;
};

/**
 * Sorts agents by the duration of their calls.
 * If a worker doesn't have a call, they will be sorted to the end.
 */
const sortWorkersByCallDuration = (a: SupervisorWorkerState, b: SupervisorWorkerState) => {
  const aCallTask = a.tasks.find(task => TaskHelper.isCallTask(task));
  const bCallTask = b.tasks.find(task => TaskHelper.isCallTask(task));

  const aIsLiveCallTask = TaskHelper.isLiveCall(aCallTask);
  const bIsLiveCallTask = TaskHelper.isLiveCall(bCallTask);

  const aDuration = aCallTask ? convertDurationToSeconds(new TaskHelper(aCallTask).durationSinceUpdate) : 0;
  const bDuration = bCallTask ? convertDurationToSeconds(new TaskHelper(bCallTask).durationSinceUpdate) : 0;

  if (aIsLiveCallTask && bIsLiveCallTask) {
    return aDuration - bDuration; // both are live calls, longest duration first
  } else if (!aIsLiveCallTask && !bIsLiveCallTask) {
    return aDuration - bDuration; // both are not live calls, longest duration first
  } else if (aIsLiveCallTask && !bIsLiveCallTask) {
    return 1; // a is a live call and b is not, a comes first
  } else if (!aIsLiveCallTask && bIsLiveCallTask) {
    return -1; // b is a live call and a is not, b comes first
  }
  return 0;
};

export const setUpSortingCalls = () => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) return;
  AgentsDataTable.defaultProps.sortCalls = sortWorkersByCallDuration;
};
