/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { Twilio } from 'twilio';
import { ConversationSID } from '@tech-matters/twilio-types';
import { AseloCustomChannel } from '../customChannels/aseloCustomChannels';
import { newErr, newOk, Result } from '../Result';

const CONVERSATION_CLOSE_TIMEOUT = 'P3D'; // ISO 8601 duration format https://en.wikipedia.org/wiki/ISO_8601
export type CreateFlexConversationParams = {
  studioFlowSid: string;
  channelType: AseloCustomChannel | 'web'; // The chat channel being used
  uniqueUserName: string; // Unique identifier for this user
  senderScreenName: string; // Friendly info to show in the Flex UI (like Telegram handle)
  onMessageAddedWebhookUrl?: string; // The url that must be used as the onMessageSent event webhook.
  conversationFriendlyName: string; // A name for the Flex conversation (typically same as uniqueUserName)
  twilioNumber: string; // The target Twilio number (usually have the shape <channel>:<id>, e.g. telegram:1234567)
  additionalConversationAttributes?: Record<string, any>; // Any additional conversation attributes
  testSessionId?: string; // A session identifier to identify the test run if this is part of an integration test.
};
/**
 * Creates a new Flex conversation in the provided Flex Flow and subscribes webhooks to it's events.
 * Adds to the channel attributes the provided twilioNumber used for routing.
 */
export const createConversation = async (
  client: Twilio,
  {
    conversationFriendlyName,
    channelType,
    twilioNumber,
    uniqueUserName,
    senderScreenName,
    onMessageAddedWebhookUrl,
    studioFlowSid,
    additionalConversationAttributes,
    testSessionId,
  }: CreateFlexConversationParams,
): Promise<
  Result<
    { conversationSid?: ConversationSID; cause: Error },
    { conversationSid: ConversationSID }
  >
> => {
  if (testSessionId) {
    console.info(
      'testSessionId specified. All outgoing messages will be sent to the test API.',
    );
  }

  const conversationInstance = await client.conversations.v1.conversations.create({
    xTwilioWebhookEnabled: 'true',
    friendlyName: conversationFriendlyName,
    uniqueName: `${channelType}/${uniqueUserName}/${Date.now()}`,
  });
  const conversationSid = conversationInstance.sid as ConversationSID;

  try {
    const conversationContext =
      client.conversations.v1.conversations.get(conversationSid);
    await conversationContext.participants.create({
      identity: uniqueUserName,
    });
    await client.conversations.v1.users
      .get(uniqueUserName)
      .update({ friendlyName: senderScreenName });
    const channelAttributes = JSON.parse((await conversationContext.fetch()).attributes);

    console.debug('channelAttributes prior to update', channelAttributes);

    await conversationContext.update({
      'timers.closed': CONVERSATION_CLOSE_TIMEOUT,
      state: 'active',
      attributes: JSON.stringify({
        ...channelAttributes,
        channel_type: channelType,
        channelType,
        senderScreenName,
        twilioNumber,
        testSessionId,
        ...additionalConversationAttributes,
      }),
    });

    await conversationContext.webhooks.create({
      target: 'studio',
      'configuration.flowSid': studioFlowSid,
      'configuration.filters': ['onMessageAdded'],
    });
    if (onMessageAddedWebhookUrl) {
      await conversationContext.webhooks.create({
        target: 'webhook',
        'configuration.method': 'POST',
        'configuration.url': onMessageAddedWebhookUrl,
        'configuration.filters': ['onMessageAdded'],
      });
    }
  } catch (err) {
    return newErr({
      message: `Create conversation failed: ${(err as Error)?.message}`,
      error: { conversationSid, cause: err as Error },
    });
  }

  return newOk({ conversationSid });
};
