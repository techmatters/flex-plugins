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
import { ITask } from '@twilio/flex-ui';

import { channelTypes } from '../states/DomainConstants';
import { getHrmConfig } from '../hrmConfig';
import { CustomITask, isTwilioTask } from '../types/types';

const getContactValueFromWebchat = task => {
  const { preEngagementData } = task.attributes;
  if (!preEngagementData) return '';
  return preEngagementData.contactIdentifier;
};

export const getNumberFromTask = (task: CustomITask) => {
  if (!isTwilioTask(task)) return null;
  if (task.channelType === channelTypes.facebook) {
    return task.defaultFrom.replace('messenger:', '');
  } else if (task.channelType === channelTypes.whatsapp) {
    return task.defaultFrom.replace('whatsapp:', '');
  } else if (task.channelType === channelTypes.modica) {
    return task.defaultFrom.replace('modica:', '');
  } else if (task.channelType === channelTypes.web) {
    return getContactValueFromWebchat(task);
  }
  return task.defaultFrom;
};

/**
 *
 * @param {ITask | CustomITask} task
 */
export const getFormattedNumberFromTask = (task: CustomITask) => {
  console.log('>>> task', task);
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
export const getTaskLanguage = ({ helplineLanguage }: Pick<ReturnType<typeof getHrmConfig>, 'helplineLanguage'>) => (
  task: ITask,
) => task.attributes.language || helplineLanguage;
