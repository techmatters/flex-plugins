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

// eslint-disable-next-line import/no-extraneous-dependencies
import twilio, { Twilio } from 'twilio';
import { getConfigValue } from '../config';

const encodeEmailToUnicode = (email: string) => {
  return Array.from(email)
    .map((char) => {
      if (/[\w]/.test(char)) {
        // Check if char is alphanumeric or underscore
        return char;
      }
      return '_' + char.codePointAt(0)?.toString(16).toUpperCase(); // Convert to Unicode hexadecimal (uppercase) for non-alphanumeric characters
    })
    .join('');
};

const deleteSmsConversationFromOneEnd = async (
  accountSid: string,
  authToken: string,
  fromNumber: string,
  toNumber: string,
) => {
  const client = twilio(accountSid, authToken);
  const activeConversations = await client.conversations.v1.conversations.list({
    state: 'active',
  });
  console.info(`${activeConversations.length} active conversations found.`);
  await Promise.all(
    activeConversations.map(async (conversation) => {
      const participants = await conversation.participants().list();

      if (
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        participants.some((participant) => {
          return (
            participant.messagingBinding?.address === fromNumber &&
            participant.messagingBinding?.proxy_address === toNumber
          );
        })
      ) {
        console.info(
          `Found a participant with the from SMS number address (${fromNumber}) and to SMS number proxy address (${toNumber}), attempting to close conversation ${conversation.sid} from ${accountSid}`,
        );
        await conversation.update({ state: 'closed' });
      }
    }),
  );
};

export const deleteSmsConversations = async (): Promise<void> => {
  const serviceAccountSid = getConfigValue('twilioAccountSid') as string;
  const serviceAuthToken = getConfigValue('twilioAuthToken') as string;
  const serviceSmsNumber = getConfigValue('smsPhoneNumber') as string;

  const senderAccountSid = getConfigValue('clientTwilioAccountSid') as string;
  const senderAuthToken = getConfigValue('clientTwilioAuthToken') as string;
  const senderSmsNumber = getConfigValue('clientSmsPhoneNumber') as string;

  // Delete conversations from service Twilio account
  await deleteSmsConversationFromOneEnd(
    serviceAccountSid,
    serviceAuthToken,
    senderSmsNumber,
    serviceSmsNumber,
  );

  // Delete conversations from sender Twilio account
  await deleteSmsConversationFromOneEnd(
    senderAccountSid,
    senderAuthToken,
    serviceSmsNumber,
    senderSmsNumber,
  );
};

export const deleteChatConversations = async (): Promise<void> => {
  const accountSid = getConfigValue('twilioAccountSid') as string;
  const authToken = getConfigValue('twilioAuthToken') as string;
  const email = getConfigValue('oktaUsername') as string;
  const encodedEmail = encodeEmailToUnicode(email);

  const client = twilio(accountSid, authToken);

  // List all users in this chat service
  const users = await client.conversations.v1.users.list();
  console.debug(`Found ${users.length} users in conversations`);
  const matchingUser = users.find((user) => user.identity === encodedEmail);

  if (!matchingUser) {
    return;
  }

  console.info(`Found user ${email} in conversations`);

  // List all channels the matching user is a part of
  const userConversations = await client.conversations.v1.users
    .get(matchingUser.sid)
    .userConversations.list();

  console.debug(`Found ${userConversations.length} chat channels for user ${email}`);

  for (const { conversationSid } of userConversations) {
    console.debug(`Removing chat channel ${conversationSid}`);
    await client.conversations.v1.conversations.get(conversationSid).remove();
  }
};

// Handle exit signals
process.on('SIGINT', () => {
  deleteChatConversations().catch((err) => console.error(err));
  deleteSmsConversations().catch((err) => console.error(err));
});
process.on('SIGTERM', () => {
  deleteChatConversations().catch((err) => console.error(err));
  deleteSmsConversations().catch((err) => console.error(err));
});
