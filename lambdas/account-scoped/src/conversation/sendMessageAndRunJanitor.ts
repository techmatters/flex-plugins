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

import type { AccountSID } from '@tech-matters/twilio-types';
import { getChatServiceSid, getTwilioClient } from '@tech-matters/twilio-configuration';
import { newErr } from '../Result';
import type { AccountScopedHandler, HttpRequest } from '../httpTypes';
import { sendSystemMessage } from './sendSystemMessage';
import { chatChannelJanitor } from './chatChannelJanitor';

export const sendMessageAndRunJanitorHandler: AccountScopedHandler = async (
  { body }: HttpRequest,
  accountSid: AccountSID,
) => {
  try {
    const { channelSid, conversationSid } = body;

    if (channelSid === undefined && conversationSid === undefined) {
      return newErr({
        message: 'none of channelSid and conversationSid provided, exactly one expected.',
        error: { statusCode: 400 },
      });
    }

    const client = await getTwilioClient(accountSid);

    if (conversationSid) {
      const conversationWebhooks = await client.conversations.v1.conversations
        .get(conversationSid)
        .webhooks.list();

      // Remove the studio trigger webhooks to prevent this channel from triggering subsequent Studio flows executions
      await Promise.all(
        conversationWebhooks.map(async w => {
          if (w.target === 'studio') {
            await w.remove();
          }
        }),
      );

      const result = await sendSystemMessage(accountSid, body);

      await chatChannelJanitor(accountSid, { conversationSid });

      return result;
    } else {
      const chatServiceSid = await getChatServiceSid(accountSid);
      const channelWebhooks = await client.chat.v2.services
        .get(chatServiceSid)
        .channels.get(channelSid)
        .webhooks.list();

      // Remove the studio trigger webhooks to prevent this channel from triggering subsequent Studio flows executions
      await Promise.all(
        channelWebhooks.map(async w => {
          if (w.type === 'studio') {
            await w.remove();
          }
        }),
      );

      const result = await sendSystemMessage(accountSid, body);

      await chatChannelJanitor(accountSid, { channelSid });

      return result;
    }
  } catch (err: any) {
    return newErr({ message: err.message, error: { statusCode: 500, cause: err } });
  }
};
