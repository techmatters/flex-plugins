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

import { AccountScopedHandler, HttpError } from '../httpTypes';
import { getAccountAuthToken } from '../configuration/twilioConfiguration';
import twilio from 'twilio';
import { isErr, newErr, newOk, Result } from '../Result';
import { getFromInternalHrmEndpoint } from './internalHrmRequest';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';

type ChatTrigger = {
  message: {
    ChannelAttributes: {
      pre_engagement_data?: {
        contactIdentifier: string;
      };
      from: string;
      channel_type: string;
    };
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

const getContactValueFromWebchat = (trigger: ChatTrigger) => {
  const preEngagementData = trigger.message.ChannelAttributes.pre_engagement_data;
  if (!preEngagementData) return '';
  return preEngagementData.contactIdentifier;
};

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

type UnsupportedChannelResultPayload = {
  type: 'unsupported-channel';
  channelType: string;
};
type UnsupportedTriggerResultPayload = { type: 'unsupported-trigger' };

const getIdentifier = (
  trigger: Event['trigger'],
  channelType?: string,
): Result<
  UnsupportedChannelResultPayload | UnsupportedTriggerResultPayload | Error,
  string
> => {
  try {
    if (isVoiceTrigger(trigger)) {
      const transformed = channelTransformations.voice.reduce(
        (accum, f) => f(accum),
        trigger.call.From,
      );
      console.debug(
        `Transformed voice identifier ${trigger.call.From} to ${transformed}`,
      );
      return newOk(transformed);
    }

    if (isChatTrigger(trigger)) {
      // webchat is a special case since it does not only depends on channel but in the task attributes too
      if (trigger.message.ChannelAttributes.channel_type === 'web') {
        const identifier = getContactValueFromWebchat(trigger);
        console.debug(`Found webchat identifier ${identifier}`);
        return newOk(identifier);
      }

      // otherwise, return the "defaultFrom" with the transformations on the identifier corresponding to each channel
      const transformed = channelTransformations[
        trigger.message.ChannelAttributes.channel_type
      ].reduce((accum, f) => f(accum), trigger.message.ChannelAttributes.from);

      console.debug(
        `Transformed chat identifier ${trigger.message.ChannelAttributes.from} to ${transformed}`,
      );
      return newOk(transformed);
    }

    if (isConversationTrigger(trigger) && channelType) {
      if (!channelTransformations[channelType] || !channelType) {
        console.error(`Channel type ${channelType} is not supported`);
        return newErr({
          message: `Channel type ${channelType} is not supported`,
          error: { type: 'unsupported-channel', channelType },
        });
      }
      const transformed = channelTransformations[channelType].reduce(
        (accum, f) => f(accum),
        trigger.conversation.Author,
      );
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

export const handleGetProfileFlagsForIdentifier: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, { flags: string[] }>> => {
  try {
    const authToken = await getAccountAuthToken(accountSid);
    const { hrm_api_version: hrmApiVersion } =
      await retrieveServiceConfigurationAttributes(twilio(accountSid, authToken));
    const { trigger, channelType } = request.body;
    const identifierResult = getIdentifier(trigger, channelType);
    if (isErr(identifierResult)) {
      if (identifierResult.error instanceof Error) {
        return newErr({
          message: identifierResult.message,
          error: { statusCode: 500, cause: identifierResult.error },
        });
      } else {
        return newErr({
          message: identifierResult.message,
          error: { statusCode: 400, cause: new Error(identifierResult.message) },
        });
      }
    }
    const identifier = identifierResult.unwrap();
    const profileFlagsByIdentifierPath = `profiles/identifier/${identifier}/flags`;
    console.info(
      `[${accountSid}] Getting profile flags for identifier ${identifier} from ${profileFlagsByIdentifierPath}`,
    );
    const responseResult = await getFromInternalHrmEndpoint<{ name: string }[]>(
      accountSid, // We use the accountSid rather than the hrmAccountId because we can't infer the hrmAccountSid based on worker at this point
      hrmApiVersion,
      profileFlagsByIdentifierPath,
    );
    if (isErr(responseResult)) {
      return newErr<HttpError>({
        message: `Request to HRM (${profileFlagsByIdentifierPath}) failed`,
        error: { statusCode: 500, cause: responseResult.error },
      });
    }
    const responseBody = responseResult.unwrap();
    console.info(
      `[${accountSid}] Profile flags for identifier ${identifier} from ${profileFlagsByIdentifierPath}`,
      responseBody,
    );
    return newOk({ flags: responseBody.map(flag => flag.name) });
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
