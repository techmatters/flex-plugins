import { ITask } from '@twilio/flex-ui';

import { channelTypes } from '../states/DomainConstants';

export function getNumberFromTask(task: ITask) {
  if (task.channelType === channelTypes.facebook) {
    return task.defaultFrom.replace('messenger:', '');
  } else if (task.channelType === channelTypes.whatsapp) {
    return task.defaultFrom.replace('whatsapp:', '');
  } else if (task.channelType === channelTypes.web) {
    return task.attributes.ip;
  }

  return task.defaultFrom;
}

/**
 *
 * @param {ITask | CustomITask} task
 * @param contactNumberFromTask
 */

export const getFormattedNumberFromTask = task =>
  task.channelType === channelTypes.twitter ? `@${task.attributes.twitterUserHandle}` : getNumberFromTask(task);
