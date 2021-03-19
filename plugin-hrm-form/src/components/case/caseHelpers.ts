import { ITask } from '@twilio/flex-ui';

import { OfficeDefinitions } from '../common/forms/types';
import { TaskEntry } from '../../states/contacts/reducer';
import { Activity, ConnectedCaseActivity } from '../../states/case/types';
import { channelsAndDefault } from '../../states/DomainConstants';

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
export const getDateFromNotSavedContact = (task: ITask, form: TaskEntry) => {
  if (task.attributes.isContactlessTask) {
    const { date: dateString, time } = form.contactlessTask;
    return new Date(`${dateString}T${time}:00`);
  }

  return Date.now();
};

/**
 * Gets Office Data (Name, Case Manager, etc.)
 * @param officeName Office name to filter
 * @param officeInformation Office Information Collection
 */
export const getOfficeData = (officeName?: string, officeInformation?: OfficeDefinitions) => {
  if (officeName && officeInformation) return officeInformation.find(x => x.name === officeName);

  return undefined;
};
