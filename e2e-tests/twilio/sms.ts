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

import { getConfigValue } from '../config';
import twilio from 'twilio';
import type { ConversationInstance } from 'twilio/lib/rest/conversations/v1/conversation';
import { AssertionError } from 'node:assert';

let clientConversation: ConversationInstance;

export const sendSmsToService = async (messageText: string) => {
  const accountSid = getConfigValue('clientTwilioAccountSid') as string;
  const authToken = getConfigValue('clientTwilioAuthToken') as string;
  const from = getConfigValue('clientSmsPhoneNumber') as string;
  const to = getConfigValue('smsPhoneNumber') as string;

  const client = twilio(accountSid, authToken);
  if (!clientConversation) {
    clientConversation = await client.conversations.v1.conversations.create({
      friendlyName: 'E2E test client conversation',

      uniqueName: `sms/${from}/${Date.now()}`,
    });
    await clientConversation.participants().create({
      identity: from,
    });
  }
  await client.messages.create({ from, to, body: messageText });
  console.debug(`Sent SMS message to service: '${messageText}'`);
};
export const sendSmsFromService = async (messageText: string) => {
  const accountSid = getConfigValue('twilioAccountSid') as string;
  const authToken = getConfigValue('twilioAuthToken') as string;
  const from = getConfigValue('smsPhoneNumber') as string;
  const to = getConfigValue('clientSmsPhoneNumber') as string;

  const client = twilio(accountSid, authToken);
  await client.messages.create({ from, to, body: messageText });
  console.debug(`Sent SMS message from service: '${messageText}'`);
};

const MAX_CHECKS = 10;

export const checkForMessageOnClient = async (messageText: string): Promise<boolean> => {
  if (!clientConversation) {
    throw new AssertionError({
      message:
        "You cannot verify incoming messages until you've sent one and created a client side conversation",
    });
  }
  for (let i = 0; i < MAX_CHECKS; i++) {
    const messages = await clientConversation.messages().list();
    if (messages.find((m) => m.body === messageText)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
};
