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
  // find the call task for each worker if it exists
  const aCallTask = a.tasks.find(task => TaskHelper.isCallTask(task));
  const bCallTask = b.tasks.find(task => TaskHelper.isCallTask(task));

  if (!aCallTask && !bCallTask) {
    // if neither worker has a call task
    return 0;
  } else if (!aCallTask) {
    // if worker a doesn't have a call task
    return -1;
  } else if (!bCallTask) {
    // if worker b doesn't have a call task
    return 1;
  }
  const aDuration = convertDurationToSeconds(new TaskHelper(aCallTask).durationSinceUpdate);
  const bDuration = convertDurationToSeconds(new TaskHelper(bCallTask).durationSinceUpdate);

  return aDuration - bDuration;
};

export const setUpSortingCalls = () => {
  AgentsDataTable.defaultProps.sortCalls = sortWorkersByCallDuration;
};
