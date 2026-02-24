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

import { AccountSID, ConversationSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { AseloCustomChannel } from './aseloCustomChannels';

const CONVERSATION_CLOSE_TIMEOUT = 'P3D'; // ISO 8601 duration format https://en.wikipedia.org/wiki/ISO_8601

export const findExistingConversation = async (
  client: Twilio,
  identity: string,
): Promise<ConversationSID | undefined> => {
  const conversations = await client.conversations.v1.participantConversations.list({
    identity,
  });
  const existing = conversations.find(conversation =>
    ['active', 'inactive'].includes(conversation.conversationState),
  );
  if (existing) {
    console.info(
      `Found existing conversation for ${identity}`,
      existing.conversationSid,
      existing,
    );
    return existing.conversationSid as ConversationSID;
  }
  console.info(`No existing conversation found for ${identity}`);
  return undefined;
};

/**
 * Sends a new message to the provided conversations channel
 */
export const sendConversationMessage = async (
  client: Twilio,
  {
    conversationSid,
    author,
    messageText,
    messageAttributes,
  }: {
    conversationSid: ConversationSID;
    author: string;
    messageText: string;
    messageAttributes?: string;
  },
) =>
  client.conversations.v1.conversations.get(conversationSid).messages.create({
    body: messageText,
    author,
    xTwilioWebhookEnabled: 'true',
    ...(messageAttributes && { attributes: messageAttributes }),
  });

export const removeConversation = async (
  client: Twilio,
  {
    conversationSid,
  }: {
    conversationSid: ConversationSID;
  },
) => client.conversations.v1.conversations(conversationSid).remove();

export { AseloCustomChannel, isAseloCustomChannel } from './aseloCustomChannels';

type CreateFlexConversationParams = {
  studioFlowSid: string;
  channelType: AseloCustomChannel; // The chat channel being used
  uniqueUserName: string; // Unique identifier for this user
  senderScreenName: string; // Friendly info to show in the Flex UI (like Telegram handle)
  onMessageSentWebhookUrl: string; // The url that must be used as the onMessageSent event webhook.
  conversationFriendlyName: string; // A name for the Flex conversation (typically same as uniqueUserName)
  testSessionId?: string; // A session identifier to identify the test run if this is part of an integration test.
  twilioNumber: string; // The target Twilio number (usually have the shape <channel>:<id>, e.g. telegram:1234567)
};

/**
 * Creates a new Flex conversation in the provided Flex Flow and subscribes webhooks to it's events.
 * Adds to the channel attributes the provided twilioNumber used for routing.
 */
const createConversation = async (
  client: Twilio,
  {
    conversationFriendlyName,
    channelType,
    twilioNumber,
    uniqueUserName,
    senderScreenName,
    onMessageSentWebhookUrl,
    studioFlowSid,
    testSessionId,
  }: CreateFlexConversationParams,
): Promise<{ conversationSid: ConversationSID; error?: Error }> => {
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
      }),
    });

    await conversationContext.webhooks.create({
      target: 'studio',
      'configuration.flowSid': studioFlowSid,
      'configuration.filters': ['onMessageAdded'],
    });

    /* const onMessageAdded = */
    await conversationContext.webhooks.create({
      target: 'webhook',
      'configuration.method': 'POST',
      'configuration.url': onMessageSentWebhookUrl,
      'configuration.filters': ['onMessageAdded'],
    });
  } catch (err) {
    return { conversationSid, error: err as Error };
  }

  return { conversationSid };
};

type SendConversationMessageToFlexParams = Omit<
  CreateFlexConversationParams,
  'twilioNumber'
> & {
  messageText: string; // The body of the message to send
  senderExternalId: string; // The id in the external chat system of the user sending the message - accountSid if not provided
  messageAttributes?: string; // [optional] The message attributes
  customSubscribedExternalId?: string; // The id in the external chat system of the user that is subscribed to the webhook
  customTwilioNumber?: string; // The target Twilio number (usually have the shape <channel>:<id>, e.g. telegram:1234567) - will be <channnel>:<accountSid> if not provided
};

/**
 * Given a uniqueUserName, tries to send a message to the active chat channel for this user.
 * To retrieve the channel we look up conversations by the user's identity using the Conversations API.
 * If the channel or the map does not exists, we create it here.
 * The uniqueUserName is typacally '<channelType>:<unique identifier of the sender>'
 *   (e.g. if the message is sent by Telegram user 1234567, the uniqueUserName will be 'telegram:1234567')
 */
export const sendConversationMessageToFlex = async (
  accountSid: AccountSID,
  {
    studioFlowSid,
    channelType,
    customTwilioNumber,
    uniqueUserName,
    senderScreenName,
    onMessageSentWebhookUrl,
    messageText,
    messageAttributes = undefined,
    senderExternalId,
    customSubscribedExternalId,
    conversationFriendlyName,
    testSessionId,
  }: SendConversationMessageToFlexParams,
): Promise<{ status: 'ignored' } | { status: 'sent'; response: any }> => {
  const subscribedExternalId = customSubscribedExternalId || accountSid;
  const twilioNumber = customTwilioNumber || `${channelType}:${subscribedExternalId}`;
  // Do not send messages that were sent by the receiverId (account subscribed to the webhook), as they were either sent from Flex or from the specific UI of the chat system
  console.info('=== sendConversationMessageToFlex ===');
  if (senderExternalId === subscribedExternalId) {
    return { status: 'ignored' };
  }
  const client = await getTwilioClient(accountSid);
  let conversationSid = await findExistingConversation(client, uniqueUserName);

  if (!conversationSid) {
    const { conversationSid: newConversationSid, error } = await createConversation(
      client,
      {
        studioFlowSid,
        channelType,
        twilioNumber,
        uniqueUserName,
        senderScreenName,
        onMessageSentWebhookUrl,
        conversationFriendlyName,
        testSessionId,
      },
    );

    if (error) {
      await removeConversation(client, {
        conversationSid: newConversationSid,
      });
      throw error;
    }

    conversationSid = newConversationSid;
  }

  const response = await sendConversationMessage(client, {
    conversationSid,
    author: uniqueUserName,
    messageText,
    messageAttributes,
  });

  console.debug('sendConversationMessageToFlex response:');
  Object.entries(response).forEach(([key, value]) => {
    console.debug(`${key}:`, value);
  });

  return { status: 'sent', response };
};
