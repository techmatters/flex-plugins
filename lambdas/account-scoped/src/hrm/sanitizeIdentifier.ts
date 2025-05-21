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

import { newErr, newOk, Result } from '../Result';
import { HrmContact } from '@tech-matters/hrm-types';

/**
 * IMPORTANT: keep up to date with flex-plugins/plugin-hrm-form/src/utils/task
 */
const trimSpaces = (s: string) => s.replaceAll(' ', '');
const trimHyphens = (s: string) => s.replaceAll('-', '');
const phoneNumberStandardization = (s: string) =>
  [trimSpaces, trimHyphens].reduce((accum, f) => f(accum), s);
// If the Aselo Connector is being used, we might get a voice From that looks like
// 'sip:+2601234567@41.52.63.73'. This regexp should normalize the string.
const aseloConnectorNormalization = (s: string) => s.match(/sip:([^@]+)/)?.[1] || s;
type TransformIdentifierFunction = (c: string) => string;
const channelTransformations: { [k: string]: TransformIdentifierFunction[] } = {
  voice: [aseloConnectorNormalization, phoneNumberStandardization],
  sms: [phoneNumberStandardization],
  whatsapp: [s => s.replace('whatsapp:', ''), phoneNumberStandardization],
  modica: [s => s.replace('modica:', ''), phoneNumberStandardization],
  messenger: [s => s.replace('messenger:', '')],
  instagram: [s => s.replace('instagram:', '')],
  line: [],
  telegram: [s => s.replace('telegram:', '')],
  web: [],
};

type ChannelAttributes = {
  pre_engagement_data?: {
    contactIdentifier: string;
  };
  from: string;
  channel_type: string;
};
type ChatTrigger = {
  message: {
    ChannelAttributes: ChannelAttributes;
  };
};
const isChatTrigger = (obj: any): obj is ChatTrigger =>
  obj && obj.message && typeof obj.message === 'object';

type VoiceTrigger = {
  call: {
    From: string;
    Caller: string;
  };
};
const isVoiceTrigger = (obj: any): obj is VoiceTrigger =>
  obj && obj.call && typeof obj.call === 'object';

export type Event = {
  trigger: ChatTrigger | VoiceTrigger | ConversationTrigger;
  request: { cookies: {}; headers: {} };
  channelType?: string;
};

type ConversationTrigger = {
  conversation: {
    Author: string;
  };
};

const isConversationTrigger = (obj: any): obj is ConversationTrigger =>
  typeof obj?.conversation === 'object';

const getContactValueFromWebchat = ({
  defaultFrom,
  preEngagementData,
}: {
  defaultFrom?: string;
  preEngagementData?: { contactIdentifier?: string };
}) => {
  return preEngagementData?.contactIdentifier || defaultFrom || '';
};

type UnsupportedChannelResultPayload = {
  type: 'unsupported-channel';
  channelType: string;
};
type UnsupportedTriggerResultPayload = { type: 'unsupported-trigger' };
type InvalidTaskAttributesResultPayload = { type: 'invalid-task-attributes' };

const applyTransformations = ({
  channelType,
  identifier,
}: {
  channelType: string;
  identifier: string;
}) => channelTransformations[channelType].reduce((accum, f) => f(accum), identifier);

export const sanitizeIdentifierFromTrigger = ({
  trigger,
  channelType,
}: {
  trigger: Event['trigger'];
  channelType?: string;
}): Result<
  UnsupportedChannelResultPayload | UnsupportedTriggerResultPayload | Error,
  string
> => {
  try {
    if (isVoiceTrigger(trigger)) {
      const transformed = applyTransformations({
        channelType: 'voice',
        identifier: trigger.call.From,
      });
      console.debug(
        `Transformed voice identifier ${trigger.call.From} to ${transformed}`,
      );
      return newOk(transformed);
    }

    if (isChatTrigger(trigger)) {
      // webchat is a special case since it does not only depends on channel but in the task attributes too
      if (trigger.message.ChannelAttributes.channel_type === 'web') {
        const identifier = getContactValueFromWebchat({
          preEngagementData: trigger.message.ChannelAttributes.pre_engagement_data,
          defaultFrom: trigger.message.ChannelAttributes.from,
        });
        console.debug(`Found webchat identifier ${identifier}`);
        return newOk(identifier);
      }

      // otherwise, return the "defaultFrom" with the transformations on the identifier corresponding to each channel
      const transformed = applyTransformations({
        channelType: trigger.message.ChannelAttributes.channel_type,
        identifier: trigger.message.ChannelAttributes.from,
      });

      console.debug(
        `Transformed chat identifier ${trigger.message.ChannelAttributes.from} to ${transformed}`,
      );
      return newOk(transformed);
    }

    if (isConversationTrigger(trigger) && channelType) {
      // TODO: handle webchat when it is migrated over to conversations
      if (!channelTransformations[channelType] || !channelType || channelType === 'web') {
        console.error(`Channel type ${channelType} is not supported`);
        return newErr({
          message: `Channel type ${channelType} is not supported`,
          error: { type: 'unsupported-channel', channelType },
        });
      }

      const transformed = applyTransformations({
        channelType,
        identifier: trigger.conversation.Author,
      });
      console.debug(
        `Transformed conversation identifier ${trigger.conversation.Author} to ${transformed}`,
      );
      return newOk(transformed);
    }
    return newErr({
      message: 'Unsupported Trigger',
      error: { type: 'unsupported-trigger' },
    });
  } catch (e) {
    const err = e as Error;
    return newErr({ message: err.message, error: err });
  }
};

export const sanitizeIdentifierFromTask = ({
  channelType,
  taskAttributes,
}: {
  channelType: HrmContact['channel'];
  taskAttributes: any;
}): Result<
  UnsupportedChannelResultPayload | InvalidTaskAttributesResultPayload | Error,
  string
> => {
  try {
    if (channelType === 'default') {
      return newOk('');
    }

    const from = taskAttributes.name || taskAttributes.name;

    if (!from) {
      return newErr({
        message: 'No "name" or "from" property present in task attributes',
        error: { type: 'invalid-task-attributes' },
      });
    }

    if (channelType === 'web') {
      const identifier = getContactValueFromWebchat({
        defaultFrom: from,
        preEngagementData: taskAttributes.preEngagementData,
      });
      console.debug(`Found webchat identifier ${identifier}`);
      return newOk(identifier);
    }

    if (!channelTransformations[channelType] || !channelType) {
      console.error(`Channel type ${channelType} is not supported`);
      return newErr({
        message: `Channel type ${channelType} is not supported`,
        error: { type: 'unsupported-channel', channelType },
      });
    }

    const transformed = applyTransformations({
      channelType,
      identifier: from,
    });
    console.debug(`Transformed identifier ${from} to ${transformed}`);
    return newOk(transformed);
  } catch (e) {
    const err = e as Error;
    return newErr({ message: err.message, error: err });
  }
};
