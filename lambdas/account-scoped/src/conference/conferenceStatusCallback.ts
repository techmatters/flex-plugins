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
import {
  AccountSID,
  CallSid,
  ConferenceSid,
  TaskSID,
  WorkspaceSID,
} from '@tech-matters/twilio-types';
import { newOk } from '../Result';
import twilio from 'twilio';
import { getTwilioClient } from '@tech-matters/twilio-configuration';

type GlobalEventType =
  | 'conference-end'
  | 'conference-start'
  | 'announcement-end'
  | 'announcement-fail';

type ParticipantEventType =
  | 'participant-leave'
  | 'participant-join'
  | 'participant-mute'
  | 'participant-unmute'
  | 'participant-hold'
  | 'participant-unhold'
  | 'participant-modify'
  | 'participant-speech-start'
  | 'participant-speech-stop';

type EventType = ParticipantEventType | GlobalEventType;

type ConferenceBaseEvent = {
  AccountSid: AccountSID;
  ConferenceSid: ConferenceSid;
  Timestamp: string;
  Coaching: boolean;
  EndConferenceOnCustomerExit: boolean;
  FriendlyName: string;
  ReservationSid: string;
  StatusCallback: string;
  BeepOnCustomerEntrance: boolean;
  CustomerCallSid: CallSid;
  SequenceNumber: number;
  WorkspaceSid: WorkspaceSID;
  StatusCallbackEvents: string;
  TaskSid: TaskSID;
};

type ConferenceGlobalEvent = ConferenceBaseEvent & {
  StatusCallbackEvent: GlobalEventType;
};

type ConferenceParticipantEvent = ConferenceBaseEvent & {
  StatusCallbackEvent: ParticipantEventType;
  CallSid: CallSid;
  ReasonParticipantLeft: string;
  ParticipantCallStatus: 'completed';
  Muted: boolean;
  Hold: boolean;
  EndConferenceOnExit: boolean;
  StartConferenceOnEnter: boolean;
};
export type ConferenceEvent = ConferenceParticipantEvent | ConferenceGlobalEvent;

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
