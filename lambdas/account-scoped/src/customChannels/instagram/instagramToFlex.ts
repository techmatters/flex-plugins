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

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import '@twilio-labs/serverless-runtime-types';
import crypto from 'crypto';
import {
  AseloCustomChannel,
  findExistingConversation,
  sendConversationMessageToFlex,
} from '../customChannelToFlex';
import { AccountScopedHandler, HttpRequest } from '../../httpTypes';
import {
  AccountSID,
  ConversationSID,
  InstagramMessageEvent,
  InstagramMessageObject,
  InstagramStoryReply,
} from '@tech-matters/twilio-types';
import { newErr, newOk } from '../../Result';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { getChannelStudioFlowSid, getFacebookAppSecret } from '../configuration';
import { Twilio } from 'twilio';

export type Body = InstagramMessageEvent & {
  xHubSignature?: string; // x-hub-signature header sent from Facebook
  bodyAsString?: string; // entire payload as string (preserves the ordering to decode and compare with xHubSignature)
};

const isMessageDeleted = (message: InstagramMessageObject['message']) =>
  message.is_deleted;

const isStoryMention = (message: InstagramMessageObject['message']) =>
  message.attachments && message.attachments[0].type === 'story_mention';

const isInstagramStoryReply = (
  message: InstagramMessageObject['message'],
): message is InstagramStoryReply =>
  typeof (message as InstagramStoryReply).reply_to?.story === 'object';

// eslint-disable-next-line no-confusing-arrow
const getStoryMentionText = (message: InstagramMessageObject['message']) =>
  message.attachments
    ? `Story mention: ${message.attachments[0].payload.url}`
    : 'Looks like this event does not include a valid url in the payload';

const unsendConversationMessage = async (
  client: Twilio,
  {
    conversationSid,
    messageExternalId,
  }: { conversationSid: ConversationSID; messageExternalId: string },
) => {
  const messages = await client.conversations.v1
    .conversations(conversationSid)
    .messages.list();

  const messageToUnsend = messages.find(
    m => JSON.parse(m.attributes).messageExternalId === messageExternalId,
  );

  return messageToUnsend?.update({ body: 'The user has unsent this message' });
};

/**
 * Validates that the payload is signed with FACEBOOK_APP_SECRET so we know it's coming from Facebook
 */
const isValidFacebookPayload = (event: Body, appSecret: string) => {
  if (!event.bodyAsString || !event.xHubSignature) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha1', appSecret)
      .update(event.bodyAsString)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(event.xHubSignature),
      Buffer.from(`sha1=${expectedSignature}`),
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Unknown error validating signature (rejecting with 403):', e);
    return false;
  }
};

export const instagramToFlexHandler: AccountScopedHandler = async (
  { body }: HttpRequest,
  accountSid: AccountSID,
) => {
  const client = await getTwilioClient(accountSid);
  const event: InstagramMessageEvent = body;
  if (!isValidFacebookPayload(event, await getFacebookAppSecret())) {
    return newErr({
      message: 'Forbidden',
      error: { statusCode: 403 },
    });
  }

  const { message, sender } = event.entry[0].messaging[0];

  let messageText = '';
  const senderExternalId = sender.id;
  const messageExternalId = message.mid;
  const subscribedExternalId = event.entry[0].id;
  const channelType = AseloCustomChannel.Instagram;
  const chatFriendlyName = `${channelType}:${senderExternalId}`;
  const uniqueUserName = `${channelType}:${senderExternalId}`;
  const senderScreenName = uniqueUserName; // TODO: see if we can use ig handle somehow
  const messageAttributes = JSON.stringify({ messageExternalId });
  const onMessageSentWebhookUrl = `${process.env.WEBHOOK_BASE_URL}/lambda/twilio/account-scoped/${accountSid}/customChannels/instagram/flexToInstagram?recipientId=${senderExternalId}`;
  const studioFlowSid = await getChannelStudioFlowSid(
    accountSid,
    AseloCustomChannel.Instagram,
  );
  let result;
  if (isInstagramStoryReply(message)) {
    return newOk({ message: 'Ignored story reply.' });
  }
  // Handle message deletion for active conversations
  if (isMessageDeleted(message)) {
    const conversationSid = await findExistingConversation(client, uniqueUserName);

    if (conversationSid) {
      // const unsentMessage =
      await unsendConversationMessage(client, {
        conversationSid,
        messageExternalId,
      });

      return newOk({
        message: `Message with external id ${messageExternalId} unsent.`,
      });
    }

    return newOk({
      message: `Message unsent with external id ${messageExternalId} is not part of an active conversation.`,
    });
  }

  // Handle story tags for active conversations
  if (isStoryMention(message)) {
    const conversationSid = await findExistingConversation(client, uniqueUserName);

    if (conversationSid) {
      messageText = getStoryMentionText(message);
    } else {
      return newOk({
        message: `Story mention with external id ${messageExternalId} is not part of an active conversation.`,
      });
    }
  }

  // If messageText is empty at this point, handle as a "regular Instagram message"
  messageText = messageText || message.text || '';

  result = await sendConversationMessageToFlex(accountSid, {
    studioFlowSid,
    channelType,
    uniqueUserName,
    senderScreenName,
    onMessageSentWebhookUrl,
    messageText,
    messageAttributes,
    senderExternalId,
    customSubscribedExternalId: subscribedExternalId,
    conversationFriendlyName: chatFriendlyName,
    testSessionId: event.testSessionId,
  });

  switch (result.status) {
    case 'sent':
      return newOk(result.response);
    case 'ignored':
      return newOk({
        message: `Ignored event ${messageExternalId}`,
      });
    default:
      return newErr({
        message: 'Reached unexpected default case',
        error: { statusCode: 500, error: new Error('Reached unexpected default case') },
      });
  }
};
