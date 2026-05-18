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

import { AccountScopedHandler, HttpRequest } from '../httpTypes';
import { AccountSID } from '@tech-matters/twilio-types';
import twilio from 'twilio';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { newOk } from '../Result';
import { ConversationEvent, ProgrammableChatEvent } from './eventTypes';

export type ServiceScopedConversationEventHandler = (
  event: any,
  accountSid: AccountSID,
  twilioClient: twilio.Twilio,
) => Promise<void>;

const eventHandlers: Record<string, ServiceScopedConversationEventHandler[]> = {};

export const registerServiceScopedConversationEventHandler = (
  eventTypes: (ConversationEvent | ProgrammableChatEvent)[],
  handler: ServiceScopedConversationEventHandler,
) => {
  for (const eventType of eventTypes) {
    if (!eventHandlers[eventType]) {
      eventHandlers[eventType] = [];
    }
    eventHandlers[eventType].push(handler);
  }
};

export const handleConversationEvent: AccountScopedHandler = async (
  { body: event }: HttpRequest,
  accountSid: AccountSID,
) => {
  console.info(`===== Service Conversation Listener (event: ${event.EventType})=====`);

  const handlers = eventHandlers[event.EventType] ?? [];
  console.info(
    `Handling conversation / programmable chat event: ${event.EventType} for account: ${accountSid} - executing ${handlers.length} registered handlers.`,
  );
  await Promise.all(
    handlers.map(async handler =>
      handler(event, accountSid, await getTwilioClient(accountSid)),
    ),
  );
  console.debug(
    `Successfully executed ${handlers.length} registered handlers for conversation / programmable chat event: ${event.EventType} for account: ${accountSid}.`,
  );
  return newOk({});
};
