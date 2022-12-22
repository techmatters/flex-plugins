import { ITask } from '@twilio/flex-ui';

import { channelTypes } from '../states/DomainConstants';

export type ContactType = 'ip' | 'email';

export const getContactValueFromWebchat = (task: ITask) => {
  const taskContactType: ContactType = task.attributes.preEngagementData.contactType;
  return task.attributes.preEngagementData[taskContactType];
};
export const getContactValueTemplate = (task: ITask): string => {
  const { contactType } = task.attributes.preEngagementData;

  if (contactType === 'ip') {
    return 'PreviousContacts-IPAddress';
  } else if (contactType === 'email') {
    return 'PreviousContacts-EmailAddress';
  }
};

export function getNumberFromTask(task: ITask) {
  if (task.channelType === channelTypes.facebook) {
    return task.defaultFrom.replace('messenger:', '');
  } else if (task.channelType === channelTypes.whatsapp) {
    return task.defaultFrom.replace('whatsapp:', '');
  } else if (task.channelType === channelTypes.web) {
    return getContactValueFromWebchat(task);
  }

  return task.defaultFrom;
}
/**
 *
 * @param {ITask | CustomITask} task
 * @param contactNumberFromTask
 */

export const getFormattedNumberFromTask = (task: ITask) => {
  return task.channelType === channelTypes.twitter ? `@${task.attributes.twitterUserHandle}` : getNumberFromTask(task);
};
