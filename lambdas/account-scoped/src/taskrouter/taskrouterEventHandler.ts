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
import { AccountSID } from '../twilioTypes';
import { newOk } from '../Result';
import { EventType } from './eventTypes';
import twilio from 'twilio';
import { getSsmParameter } from '../ssmCache';

export type TaskRouterEventHandler = (
  event: any,
  accountSid: AccountSID,
  twilioClient: twilio.Twilio,
) => Promise<void>;

const eventHandlers: Record<string, TaskRouterEventHandler[]> = {};

export const registerTaskRouterEventHandler = (
  eventTypes: EventType[],
  handler: TaskRouterEventHandler,
) => {
  for (const eventType of eventTypes) {
    if (!eventHandlers[eventType]) {
      eventHandlers[eventType] = [];
    }
    eventHandlers[eventType].push(handler);
  }
};

export const clearTaskRouterEventHandlers = () => {
  for (const eventType in eventHandlers) {
    delete eventHandlers[eventType];
  }
};

export const handleTaskRouterEvent: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const handlers = eventHandlers[body.EventType] ?? [];
  console.info(
    `Handling task router event: ${body.EventType} for account: ${accountSid} - executing ${handlers.length} registered handlers.`,
  );
  await Promise.all(
    handlers.map(async handler => {
      const authToken = await getSsmParameter(
        `/${process.env.NODE_ENV}/twilio/${accountSid}/auth_token`,
      );
      const client = twilio(accountSid, authToken);
      return handler(body, accountSid, client);
    }),
  );
  console.debug(
    `Successfully executed ${handlers.length} registered handlers task router event: ${body.EventType} for account: ${accountSid}.`,
  );
  return newOk({});
};
