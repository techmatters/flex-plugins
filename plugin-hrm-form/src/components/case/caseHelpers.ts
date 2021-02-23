import { TaskEntry } from '../../states/contacts/reducer';
import { Activity, ConnectedCaseActivity } from '../../states/case/types';
import { channelsAndDefault } from '../../states/DomainConstants';
import { CustomITask, isOfflineContactTask } from '../../types/types';

/**
 * Returns true if the activity provided is a connected case activity (included in channelsAndDefault const object)
 * @param activity Timeline Activity
 */
export const isConnectedCaseActivity = (activity): activity is ConnectedCaseActivity =>
  Boolean(channelsAndDefault[activity.type]);

/**
 * Sort activities from most recent to oldest.
 * @param activities Activities to sort
 */
export const sortActivities = (activities: Activity[]): Activity[] =>
  activities.sort((a, b) => b.date.localeCompare(a.date));

/**
 * Gets date from the entry form (for a contact that hasn't been saved).
 * @param task Twilio Task Sid
 * @param form Entry Form
 */
export const getDateFromNotSavedContact = (task: CustomITask, form: TaskEntry) => {
  if (isOfflineContactTask(task)) {
    const { date: dateString, time } = form.contactlessTask;
    return new Date(`${dateString}T${time}:00`);
  }

  return Date.now();
};
