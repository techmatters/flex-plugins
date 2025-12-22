/**
 * Copyright (C) 2021-2025 Technology Matters
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

import {
  registerServiceScopedConversationEventHandler,
  ServiceScopedConversationEventHandler,
} from './serviceScopedConversationEventHandler';
import type { AccountSID, ConversationSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import { getServerlessBaseUrl } from '@tech-matters/twilio-configuration';
import { MESSAGE_ADDED } from './eventTypes';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';

type OnMessageAddedEvent = {
  EventType: 'onMessageAdded';
  Body?: string;
  ConversationSid: ConversationSID;
  Media?: Record<string, any>;
  DateCreated: Date;
};

export type Event = OnMessageAddedEvent;

const FALLBACK_ERROR_MESSAGE = 'Unsupported message type.';
const ERROR_MESSAGE_TRANSLATION_KEY = 'UnsupportedMediaErrorMsg';

const unsupportedMediaErrorConversationHandler: ServiceScopedConversationEventHandler =
  async (
    event: OnMessageAddedEvent,
    accountSid: AccountSID,
    client: Twilio,
  ): Promise<void> => {
    const { Body: body, Media: media, ConversationSid: conversationSid } = event;

    /* Valid message will have either a body/media. A message with no
       body or media implies that there was an error sending such message
    */
    if (!body && !media) {
      console.debug('Message has no text body or media, sending error.', conversationSid);
      let messageText = FALLBACK_ERROR_MESSAGE;

      const serviceConfigAttributes =
        await retrieveServiceConfigurationAttributes(client);
      const helplineLanguage = serviceConfigAttributes.helplineLanguage ?? 'en-US';

      console.debug(
        'Helpline language to send error message: ',
        helplineLanguage,
        conversationSid,
      );
      if (helplineLanguage) {
        try {
          const response = await fetch(
            `https://${await getServerlessBaseUrl(accountSid)}/translations/${helplineLanguage}/messages.json`,
          );
          const translation = (await response.json()) as Record<string, string>;
          const { [ERROR_MESSAGE_TRANSLATION_KEY]: translatedMessage } = translation;

          console.debug('Translated error message: ', translatedMessage, conversationSid);
          messageText = translatedMessage || messageText;
        } catch {
          console.warn(
            `Couldn't retrieve ${ERROR_MESSAGE_TRANSLATION_KEY} message translation for ${helplineLanguage}`,
            conversationSid,
          );
        }
      }
      await client.conversations.v1.conversations.get(conversationSid).messages.create({
        body: messageText,
        author: 'Bot',
        xTwilioWebhookEnabled: 'true',
      });

      console.info('Sent error message: ', messageText, conversationSid);
    }
  };

registerServiceScopedConversationEventHandler(
  [MESSAGE_ADDED],
  unsupportedMediaErrorConversationHandler,
);
