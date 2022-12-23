import { ITask } from '@twilio/flex-ui';

import { channelTypes } from '../states/DomainConstants';

const getContactValueFromWebchat = task => {
  const { preEngagementData } = task.attributes;
  if (!preEngagementData) return '';
  return task.attributes.preEngagementData[preEngagementData.contactType];
};

export const getNumberFromTask = (task: ITask) => {
  if (task.channelType === channelTypes.facebook) {
    return task.defaultFrom.replace('messenger:', '');
  } else if (task.channelType === channelTypes.whatsapp) {
    return task.defaultFrom.replace('whatsapp:', '');
  } else if (task.channelType === channelTypes.web) {
    return getContactValueFromWebchat(task);
  }
  return task.defaultFrom;
};

/**
 *
 * @param {ITask | CustomITask} task
 * @param contactNumberFromTask
 */
export const getFormattedNumberFromTask = (task: ITask) => {
  return task.channelType === channelTypes.twitter ? `@${task.attributes.twitterUserHandle}` : getNumberFromTask(task);
};

// eslint-disable-next-line consistent-return
export const getContactValueTemplate = task => {
  const { preEngagementData } = task.attributes;
  if (!preEngagementData) return '';
  if (preEngagementData.contactType === 'ip') {
    return 'PreviousContacts-IPAddress';
  } else if (preEngagementData.contactType === 'email') {
    return 'PreviousContacts-EmailAddress';
  }
};
