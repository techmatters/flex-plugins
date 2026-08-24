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
// eslint-disable-next-line import/no-extraneous-dependencies
import twilio from 'twilio';
import { AssertionError } from 'node:assert';
import { ChatStatement, ChatStatementOrigin } from '../chatModel';

// Tracks the start of the current SMS test session so we only check messages received after this time
let sessionStartTime: Date | undefined;

let clientConversationSid: string;

export const sendSmsToService = async (messageText: string) => {
  if (!sessionStartTime) {
    sessionStartTime = new Date();
  }
  const clientAccountSid = getConfigValue('clientTwilioAccountSid') as string;
  const authToken = getConfigValue('clientTwilioAuthToken') as string;
  const from = getConfigValue('clientSmsPhoneNumber') as string;
  const serviceAccountSid = getConfigValue('twilioAccountSid') as string;
  const to = getConfigValue('smsPhoneNumber') as string;

  const client = twilio(clientAccountSid, authToken);
  if (!clientConversationSid) {
    const clientConversation = await client.conversations.v1.conversations.create({
      friendlyName: `E2E test conversation with ${serviceAccountSid}, ${new Date().toISOString()}`,
    });
    await clientConversation.participants().create({
      'messagingBinding.address': to,
      'messagingBinding.proxyAddress': from,
      'messagingBinding.type': 'sms',
    } as any);
    clientConversationSid = clientConversation.sid;
  }
  await client.conversations.v1.conversations
    .get(clientConversationSid)
    .messages.create({ author: from, body: messageText });
  console.debug(`Sent SMS message to service: '${messageText}'`);
};

const MAX_CHECKS = 10;

/**
 * Checks whether the given message text was received by the SMS client (i.e., sent from the
 * service to the client phone number) at any point since the current session started.
 * Uses the service Twilio account to list outbound messages to the client number.
 */
export const checkForMessageOnClient = async (messageText: string): Promise<boolean> => {
  if (!clientConversationSid) {
    throw new AssertionError({
      message: "You cannot verify incoming messages until you've sent one and started a session",
    });
  }
  const accountSid = getConfigValue('clientTwilioAccountSid') as string;
  const authToken = getConfigValue('clientTwilioAuthToken') as string;
  const to = getConfigValue('clientSmsPhoneNumber') as string;

  const client = twilio(accountSid, authToken);
  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  for (let i = 0; i < MAX_CHECKS; i++) {
    const messages = await client.conversations.v1.conversations
      .get(clientConversationSid)
      .messages.list();
    //client.conversations.v1.roles.l
    if (messages.find((m) => m.body === messageText && m.author !== to)) {
      return true;
    }
    await delay(1000);
  }
  return false;
};

/**
 * Asserts that the given message text was received by the SMS client within the polling window.
 * Throws if the message is not found.
 */
const assertMessageReceivedOnClient = async (messageText: string): Promise<void> => {
  const received = await checkForMessageOnClient(messageText);
  if (!received) {
    throw new AssertionError({
      message: `SMS message not received on client: '${messageText}'`,
    });
  }
};

/**
 * Runs the 'client side' of an SMS conversation using the Twilio Messages API.
 * It loops through a list of chat statements, sending caller SMS messages via the API and
 * polling for expected bot/counselor messages on the client number.
 * As soon as it hits a counselor statement (COUNSELOR or COUNSELOR_AUTO), it yields execution
 * back to the calling code so it can action those statements in Flex.
 *
 * A similar function exists in flexChat.ts to handle the counselor side of the conversation.
 * Both iterate the same shared ChatStatement list, yielding control when they hit a statement
 * the other side needs to handle.
 * @param statements - a unified list of all the chat statements in a conversation
 */
export async function* smsChat(statements: ChatStatement[]): AsyncGenerator<ChatStatement> {
  for (const statementItem of statements) {
    const { text, origin } = statementItem;
    switch (origin) {
      case ChatStatementOrigin.CALLER:
        await sendSmsToService(text);
        break;
      case ChatStatementOrigin.BOT: {
        await assertMessageReceivedOnClient(text);
        break;
      }
      default:
        yield statementItem;
        await assertMessageReceivedOnClient(text);
    }
  }
}
