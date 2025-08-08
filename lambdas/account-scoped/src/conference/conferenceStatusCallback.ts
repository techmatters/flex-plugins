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

import { AccountScopedHandler } from '../httpTypes';
import { AccountSID, CallSid, ConferenceSid } from '../twilioTypes';
import { newOk } from '../Result';
import twilio from 'twilio';
import { getTwilioClient } from '../configuration/twilioConfiguration';

type EventType =
  | 'conference-end'
  | 'conference-start'
  | 'participant-leave'
  | 'participant-join'
  | 'participant-mute'
  | 'participant-unmute'
  | 'participant-hold'
  | 'participant-unhold'
  | 'participant-modify'
  | 'participant-speech-start'
  | 'participant-speech-stop'
  | 'announcement-end'
  | 'announcement-fail';

export type ConferenceEvent = {
  AccountSid: AccountSID;
  ConferenceSid: ConferenceSid;
  Timestamp: string;
  StatusCallbackEvent: EventType;
} & {
  StatusCallbackEvent: 'participant-leave' | 'participant-join';
  CallSid: CallSid;
};

export type ConferenceStatusEventHandler = (
  event: ConferenceEvent,
  accountSid: AccountSID,
  twilioClient: twilio.Twilio,
) => Promise<void>;

const eventHandlers: Record<string, ConferenceStatusEventHandler[]> = {};

export const registerTaskRouterEventHandler = (
  eventTypes: EventType[],
  handler: ConferenceStatusEventHandler,
) => {
  for (const eventType of eventTypes) {
    if (!eventHandlers[eventType]) {
      eventHandlers[eventType] = [];
    }
    eventHandlers[eventType].push(handler);
  }
};

export const conferenceStatusCallbackHandler: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const conferenceEvent = body as ConferenceEvent;
  const handlers = eventHandlers[conferenceEvent.StatusCallbackEvent] ?? [];
  console.info(
    `Handling task router event: ${conferenceEvent.StatusCallbackEvent} for account: ${accountSid} - executing ${handlers.length} registered handlers.`,
  );
  console.debug(`Event`, conferenceEvent);

  await Promise.all(
    handlers.map(async handler =>
      handler(conferenceEvent, accountSid, await getTwilioClient(accountSid)),
    ),
  );
  console.debug(
    `Successfully executed ${handlers.length} registered handlers task router event: ${body.EventType} for account: ${accountSid}.`,
  );
  return newOk({});
};