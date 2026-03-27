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

import { ConversationInstance } from 'twilio/lib/rest/conversations/v1/conversation';
import { Twilio } from 'twilio';
import { ConversationSID } from '@tech-matters/twilio-types';

// TODO: Add optimistic concurrency checks
/**
 *
 * @param client - Twilio client
 * @param conversation - either the instance of the conversation which must have been fetched prior to calling, or the sid to fetch
 * @param attributePatch - attributes to update. Will add these if they don't exist or overwrite them if they do. Setting attributes undefined will NOT remove them, there will be an attribute e
 */
export const patchConversationAttributes = async (
  client: Twilio,
  conversation: ConversationInstance | ConversationSID,
  attributePatch: Record<string, any>,
) => {
  let conversationInstance: ConversationInstance;
  if (typeof conversation !== 'object') {
    conversationInstance = await client.conversations.v1.conversations
      .get(conversation)
      .fetch();
  } else {
    conversationInstance = conversation;
  }
  const conversationAttributes = JSON.parse(conversationInstance.attributes);
  const patchedAttributes = { ...conversationAttributes, ...attributePatch };
  return client.conversations.v1.conversations
    .get(conversationInstance.sid)
    .update({ attributes: patchedAttributes });
};
