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

import { ChannelTypes, channelTypes } from '../states/DomainConstants';
import { getHrmConfig } from '../hrmConfig';
import { CustomITask, isTwilioTask } from '../types/types';

const getContactValueFromWebchat = task => {
  const { preEngagementData } = task.attributes;
  if (!preEngagementData) return '';
  return preEngagementData.contactIdentifier;
};

/**
 * IMPORTANT: keep up to date with serverless/functions/getProfileFlagsForIdentifier
 */
const trimSpaces = (s: string) => s.replaceAll(' ', '');
const trimHyphens = (s: string) => s.replaceAll('-', '');
const phoneNumberStandardization = (s: string) => [trimSpaces, trimHyphens].reduce((accum, f) => f(accum), s);
type TransformIdentifierFunction = (c: string) => string;
const channelTransformations: { [k in ChannelTypes]: TransformIdentifierFunction[] } = {
  voice: [phoneNumberStandardization],
  sms: [phoneNumberStandardization],
  whatsapp: [s => s.replace('whatsapp:', ''), phoneNumberStandardization],
  modica: [s => s.replace('modica:', ''), phoneNumberStandardization],
  facebook: [s => s.replace('messenger:', '')],
  messenger: [s => s.replace('messenger:', '')],
  instagram: [],
  line: [],
  telegram: [],
  web: [],
};

/**
 * IMPORTANT: if any logic is changed here, replicate it in serverless/functions/getProfileFlagsForIdentifier.protected.ts
 */
export const getNumberFromTask = (task: CustomITask) => {
  if (!isTwilioTask(task)) return null;

  const { channelType, defaultFrom } = task;

  // webchat is a special case since it does not only depends on channel but in the task attributes too
  if (channelType === channelTypes.web) {
    return getContactValueFromWebchat(task);
  }

  const transformedNumber = channelTransformations[channelType as ChannelTypes];

  // Ensure transformedNumber is an array before calling reduce
  if ((!Array.isArray(transformedNumber) || transformedNumber.length === 0) && channelType !== undefined) {
    console.error(`Channel type ${channelType} is not supported or transformation array is invalid`, transformedNumber);
    return null;
  }

  if (defaultFrom === undefined || defaultFrom === null || !defaultFrom) {
    console.error(`defaultFrom is undefined for channelType ${channelType}`);
    return null;
  }

  return transformedNumber.reduce((accum, f) => f(accum), defaultFrom);
};

/**
 *
 * @param {ITask | CustomITask} task
 */
export const getFormattedNumberFromTask = (task: CustomITask) => {
  return task.channelType === channelTypes.telegram
    ? `@${task.attributes.telegramUserHandle}`
    : getNumberFromTask(task);
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
