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

import { getAseloFeatureFlags } from '../../hrmConfig';

const ACTIVITIES = Array.from(Manager.getInstance().store.getState().flex.worker.activities.values()).reduce(
  (accum, activity, currIndex) => {
    accum[activity.name] = currIndex;
    return accum;
  },
  {},
);

/**
 * Converts a duration string in the format "HH:MM:SS" or "MM:SS" to seconds.
 */
const convertTaskDurationToSeconds = (duration: string): number => {
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
  return task ? convertTaskDurationToSeconds(new TaskHelper(task).durationSinceUpdate) : 0;
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

/**
 * Sorts agents by the duration of their chat tasks.
 * If a worker has multiple chat tasks, they will be sorted by the duration of the first chat task.
 * If a worker doesn't have a chat task, they will be sorted to the end.
 */

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

/**
 * Sorts agents by the number of available skills they have.
 */
export const sortSkills = (a: SupervisorWorkerState, b: SupervisorWorkerState) => {
  const getSkillLength = (workerState: SupervisorWorkerState): number =>
    workerState?.worker?.source?.attributes?.routing?.skills?.length ?? 0;

  const aSkills = getSkillLength(a);
  const bSkills = getSkillLength(b);

  return aSkills - bSkills;
};

/**
 * Converts a duration string in the format "59s", "59:59", "23h" or "23h 59min", "59d" or "5d 3h" to seconds, and '30+d' to seconds.
 */
const convertDurationToSeconds = (duration: string): number => {
  // Handle the "59:59" format (minutes and seconds)
  if (duration.includes(':')) {
    const [minutes, secs] = duration.split(':').map(Number);
    return (minutes || 0) * 60 + (secs || 0);
  }

  // Handle the "30+d" format
  if (duration.includes('+d')) {
    const days = parseInt(duration.split('d')[0], 10);
    return days * 60 * 60 * 24 * 30;
  }

  // Handle all other formats
  const timeParts = duration.match(/\d+\s*[a-z]+/gi); // e.g. "23h 59min" or "59min"
  let seconds = 0;

  timeParts.forEach(timePart => {
    const value = parseInt(timePart, 10);
    const unit = timePart.match(/[a-z]+/i)[0];

    switch (unit) {
      case 's':
        seconds += value;
        break;
      case 'min':
      case 'm':
        seconds += value * 60;
        break;
      case 'h':
        seconds += value * 60 * 60;
        break;
      case 'd':
        seconds += value * 60 * 60 * 24;
        break;
      default:
        console.warn(`Unrecognized time unit: ${unit} for value: ${value}`);
        break;
    }
  });

  return seconds;
};

/**
 * Sort by Status/Activity column
 *
 * Sort available workers first, offline workers last, then by helpline's activity index,
 * then within each activity by duration, with longest to shortest
 */
export const sortStatusColumn = (a: SupervisorWorkerState, b: SupervisorWorkerState) => {
  // Handle undefined values
  if (!a || !b) return 0;

  // Place available workers at the top
  if (a.worker.isAvailable !== b.worker.isAvailable) {
    return a.worker.isAvailable ? 1 : -1;
  }

  const aActivityValue = ACTIVITIES[a.worker.activityName] || 0;
  const bActivityValue = ACTIVITIES[b.worker.activityName] || 0;

  // Place workers with "Offline" activity at the end
  if (aActivityValue === 0 && bActivityValue === 0) {
    // If both are offline, sort by duration
    const aDuration = convertDurationToSeconds(a.worker.activityDuration);
    const bDuration = convertDurationToSeconds(b.worker.activityDuration);
    return aDuration - bDuration;
  } else if (aActivityValue === 0) {
    return -1;
  } else if (bActivityValue === 0) {
    return 1;
  }

  // Sort alphabetically by activity name
  if (a.worker.activityName !== b.worker.activityName) {
    return a.worker.activityName.localeCompare(b.worker.activityName);
  }

  // Sort by duration within the same activity
  const aDuration = convertDurationToSeconds(a.worker.activityDuration);
  const bDuration = convertDurationToSeconds(b.worker.activityDuration);
  return aDuration - bDuration;
};

// Set up the sorting for default Teams View columns (Workers, Calls, Tasks)
export const setUpTeamsViewSorting = () => {
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) return;

  AgentsDataTable.defaultProps.sortCalls = sortWorkersByCallDuration;
  AgentsDataTable.defaultProps.sortTasks = sortWorkersByChatDuration;
  AgentsDataTable.defaultProps.defaultSortColumn = 'worker';
};
