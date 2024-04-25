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

import { AgentsDataTable, TaskHelper, Manager } from '@twilio/flex-ui';
import { SupervisorWorkerState } from '@twilio/flex-ui/src/state/State.definition';

import { getAseloFeatureFlags } from '../hrmConfig';

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

const getTaskDurationInSeconds = (task): number => {
  return task ? convertDurationToSeconds(new TaskHelper(task).durationSinceUpdate) : 0;
};

const sortTasksByDuration = (aTask, bTask): number => {
  const aDuration = getTaskDurationInSeconds(aTask);
  const bDuration = getTaskDurationInSeconds(bTask);
  return aDuration - bDuration;
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

  if (aIsLiveCallTask && bIsLiveCallTask) {
    return sortTasksByDuration(aCallTask, bCallTask); // both are live calls, longest duration first
  } else if (!aIsLiveCallTask && !bIsLiveCallTask) {
    return sortTasksByDuration(aCallTask, bCallTask); // both are not live calls, longest duration first
  } else if (aIsLiveCallTask && !bIsLiveCallTask) {
    return 1; // a is a live call and b is not, a comes first
  } else if (!aIsLiveCallTask && bIsLiveCallTask) {
    return -1; // b is a live call and a is not, b comes first
  }
  return 0;
};

const sortWorkersByChatDuration = (a: SupervisorWorkerState, b: SupervisorWorkerState) => {
  const aChatTasks = a.tasks.filter(task => TaskHelper.isChatBasedTask(task));
  const bChatTasks = b.tasks.filter(task => TaskHelper.isChatBasedTask(task));

  const taskLengthDifference = aChatTasks.length - bChatTasks.length;
  if (taskLengthDifference !== 0) {
    return taskLengthDifference;
  }

  if (aChatTasks.length > 0) {
    return sortTasksByDuration(aChatTasks[0], bChatTasks[0]);
  }

  return 0;
};

const sortWorkersByActivity = (a: SupervisorWorkerState, b: SupervisorWorkerState) => {
  const ACTIVITIES = Array.from(Manager.getInstance().store.getState().flex.worker.activities.values()).reduce(
    (accum, activity, currIndex) => {
      accum[activity.name] = currIndex;
      return accum;
    },
    {},
  );

  const aActivityValue = ACTIVITIES[a?.worker.activityName];
  const bActivityValue = ACTIVITIES[b?.worker.activityName];

  // Place available workers at the top
  const aAvailability = a.worker.isAvailable ? 1 : 0;
  const bAvailability = b.worker.isAvailable ? 1 : 0;

  const availability = bAvailability - aAvailability;
  if (availability !== 0) return availability;

  // Place workers with "Offline" activity at the end
  if (aActivityValue === 0 && bActivityValue === 0) {
    // If both are offline, sort by worker name
    return a.worker.name.localeCompare(b.worker.name);
  } else if (aActivityValue === 0) {
    // only a is offline, place a at the end
    return 1;
  } else if (bActivityValue === 0) {
    // only b is offline, place b at the end
    return -1;
  }

  // Sort by activity value/index
  if (aActivityValue !== bActivityValue) {
    return aActivityValue > bActivityValue ? 1 : -1;
  }

  // If activities are the same, sort by worker name
  return a.worker.name.localeCompare(b.worker.name);
};

export const setUpTeamsViewSorting = () => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) return;

  AgentsDataTable.defaultProps.sortCalls = sortWorkersByCallDuration;
  AgentsDataTable.defaultProps.sortTasks = sortWorkersByChatDuration;
  AgentsDataTable.defaultProps.sortWorkers = sortWorkersByActivity;
  AgentsDataTable.defaultProps.defaultSortColumn = 'worker';
};

export const sortSkills = (a: SupervisorWorkerState, b: SupervisorWorkerState) => {
  const aSkills = a?.worker?.source?.attributes?.routing?.skills?.length ?? 0;
  const bSkills = b?.worker?.source?.attributes?.routing?.skills?.length ?? 0;
  return aSkills - bSkills;
};
