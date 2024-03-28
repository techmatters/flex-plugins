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

  if (!aCallTask && !bCallTask) {
    return 0;
  } else if (!aCallTask) {
    return -1;
  } else if (!bCallTask) {
    return 1;
  }
  const aDuration = convertDurationToSeconds(new TaskHelper(aCallTask).durationSinceUpdate);
  const bDuration = convertDurationToSeconds(new TaskHelper(bCallTask).durationSinceUpdate);

  return aDuration - bDuration;
};

export const setUpSortingCalls = () => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) return;
  AgentsDataTable.defaultProps.sortCalls = sortWorkersByCallDuration;
};
