import { Twilio } from 'twilio';
import { ConversationSID } from '@tech-matters/twilio-types';
import { AseloCustomChannel } from '../customChannels/aseloCustomChannels';

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
        ...additionalConversationAttributes,
      }),
    });

    await conversationContext.webhooks.create({
      target: 'studio',
      'configuration.flowSid': studioFlowSid,
      'configuration.filters': ['onMessageAdded'],
    });
    if (onMessageAddedWebhookUrl) {
      /* const onMessageAdded = */
      await conversationContext.webhooks.create({
        target: 'webhook',
        'configuration.method': 'POST',
        'configuration.url': onMessageAddedWebhookUrl,
        'configuration.filters': ['onMessageAdded'],
      });
    }
  } catch (err) {
    return { conversationSid, error: err as Error };
  }

  return { conversationSid };
};
