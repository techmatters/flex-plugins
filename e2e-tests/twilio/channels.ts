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
import twilio from 'twilio';
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

export const deleteChatChannels = async (): Promise<void> => {
  const accountSid = getConfigValue('twilioAccountSid') as string;
  const authToken = getConfigValue('twilioAuthToken') as string;
  const email = getConfigValue('oktaUsername') as string;
  const encodedEmail = encodeEmailToUnicode(email);

  const client = twilio(accountSid, authToken);

  // List all chat services
  const services = await client.chat.v2.services.list();

  for (const service of services) {
    // List all users in this chat service
    const users = await client.chat.v2.services(service.sid).users.list();
    console.log(`Found ${users.length} users in service ${service.sid}`);
    const matchingUser = users.find((user) => user.identity === encodedEmail);

    if (!matchingUser) {
      continue;
    }

    console.log(`Found user ${email} in service ${service.sid}`);

    // List all channels the matching user is a part of
    const userChannels = await client.chat.v2
      .services(service.sid)
      .users(matchingUser.sid)
      .userChannels.list();

    console.log(
      `Found ${userChannels.length} chat channels for user ${email} in service ${service.sid}`,
    );

    for (const userChannel of userChannels) {
      console.log(`Removing chat channel ${userChannel.channelSid} from service ${service.sid}`);
      await client.chat.v2.services(service.sid).channels(userChannel.channelSid).remove();
    }
  }
};

// Handle exit signals
process.on('SIGINT', () => {
  deleteChatChannels().catch((err) => console.error(err));
});
process.on('SIGTERM', () => {
  deleteChatChannels().catch((err) => console.error(err));
});
