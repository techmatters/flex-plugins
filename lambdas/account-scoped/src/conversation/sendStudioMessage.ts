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

import type { AccountSID, ChatChannelSID } from '@tech-matters/twilio-types';
import { getChatServiceSid, getTwilioClient } from '@tech-matters/twilio-configuration';
import { newErr } from '../Result';
import type { AccountScopedHandler, HttpRequest } from '../httpTypes';
import { sendSystemMessage } from './sendSystemMessage';

const removeStudioWebhook = async (
  accountSid: AccountSID,
  channelSid: ChatChannelSID,
): Promise<void> => {
  const client = await getTwilioClient(accountSid);
  const chatServiceSid = await getChatServiceSid(accountSid);
  const webhooks = await client.chat.v2.services
    .get(chatServiceSid)
    .channels.get(channelSid)
    .webhooks.list();

  const studioWebhook = webhooks.find(w => w.type === 'studio');
  await studioWebhook?.remove();
};

export const sendStudioMessageHandler: AccountScopedHandler = async (
  { body }: HttpRequest,
  accountSid: AccountSID,
) => {
  try {
    const { channelSid } = body;

    /**
     * We need to remove the studio webhook before calling sendSystemMessage
     * because it would trigger another execution of studio.
     */
    await removeStudioWebhook(accountSid, channelSid);
    return await sendSystemMessage(accountSid, body);
  } catch (err: any) {
    return newErr({ message: err.message, error: { statusCode: 500, cause: err } });
  }
};
