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

import twilio from 'twilio';
import { omit } from 'lodash';
import type { ChannelInstance } from 'twilio/lib/rest/chat/v2/service/channel';
import { ConversationInstance } from 'twilio/lib/rest/conversations/v1/conversation';
import { LexClient } from './lexClient';
import {
  handleChannelRelease,
  type CapturedChannelAttributes,
} from './channelCaptureHandlers';
import { Twilio } from 'twilio';
import { AccountScopedHandler, HttpError } from '../httpTypes';
import { newErr, newOk, Result } from '../Result';
import {
  getAccountAuthToken,
  getChatServiceSid,
  getTwilioWorkspaceSid,
} from '../configuration/twilioConfiguration';
import { AccountSID } from '../twilioTypes';

type ChatbotCallbackCleanupParams = {
  accountSid: AccountSID;
  twilioWorkspaceSid: string;
  channel?: ChannelInstance;
  conversation?: ConversationInstance;
  twilioClient: Twilio;
  channelAttributes: { [k: string]: any };
  memory?: { [key: string]: string | number };
};

export const chatbotCallbackCleanup = async ({
  accountSid,
  twilioWorkspaceSid,
  twilioClient,
  channel,
  conversation,
  channelAttributes,
  memory: lexMemory,
}: ChatbotCallbackCleanupParams) => {
  const memory = lexMemory || {};

  const capturedChannelAttributes =
    channelAttributes.capturedChannelAttributes as CapturedChannelAttributes;

  const releasedChannelAttributes = {
    ...omit(channelAttributes, ['capturedChannelAttributes']),
    ...(capturedChannelAttributes?.memoryAttribute
      ? { [capturedChannelAttributes.memoryAttribute]: memory }
      : { memory }),
    ...(capturedChannelAttributes?.releaseFlag && {
      [capturedChannelAttributes.releaseFlag]: true,
    }),
  };

  const updateChannelOrConversationAttributes = async (attributesObj: any) => {
    const attributes = JSON.stringify(attributesObj);

    if (conversation) {
      await conversation.update({
        attributes,
      });
    } else {
      await channel!.update({
        attributes,
      });
    }
  };

  const removeWebhookFromChannelOrConversation = async () => {
    if (!capturedChannelAttributes?.chatbotCallbackWebhookSid) {
      console.warn(
        'No chatbotCallbackWebhookSid found in capturedChannelAttributes for this conversation - looks like something went wrong setting up the chatbot.',
      );
      return;
    }

    if (conversation) {
      await conversation
        .webhooks()
        .get(capturedChannelAttributes.chatbotCallbackWebhookSid)
        .remove();
    } else if (channel) {
      await channel
        .webhooks()
        .get(capturedChannelAttributes.chatbotCallbackWebhookSid)
        .remove();
    }
  };

  const { botLanguage, botSuffix, enableLexV2, environment, helplineCode, userId } =
    capturedChannelAttributes;

  const shouldDeleteSession =
    botLanguage && botSuffix && environment && helplineCode && userId;

  await Promise.all([
    // Delete Lex session. This is not really needed as the session will expire, but that depends on the config of Lex.
    shouldDeleteSession &&
      LexClient.deleteSession({
        botLanguage,
        botSuffix,
        enableLexV2,
        environment,
        helplineCode,
        sessionId: userId,
      }),
    // Update channel attributes (remove channelCapturedByBot and add memory)
    updateChannelOrConversationAttributes(releasedChannelAttributes),
    // Remove this webhook from the channel
    removeWebhookFromChannelOrConversation(),
    // Trigger the next step once the channel is released
    capturedChannelAttributes &&
      handleChannelRelease({
        accountSid,
        capturedChannelAttributes,
        channelOrConversation: conversation ?? channel!,
        twilioClient,
        twilioWorkspaceSid,
        memory,
      }),
  ]);
};

export const handleChatbotCallbackCleanup: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, {}>> => {
  console.log('handleChatbotCallbackCleanup called with parameters', request.body);
  try {
    const authToken = await getAccountAuthToken(accountSid);
    const twilioClient = twilio(accountSid, authToken);

    const { channelSid } = request.body;
    if (!channelSid) {
      const message = 'Missing channelSid parameter';
      console.error(message);
      return newErr({
        message,
        error: { statusCode: 400, cause: new Error(message) },
      });
    }

    let channel: ChannelInstance | undefined;
    const conversation = await twilioClient.conversations.v1
      .conversations(channelSid)
      .fetch();

    const chatServiceSid = await getChatServiceSid(accountSid);
    const twilioWorkspaceSid = await getTwilioWorkspaceSid(accountSid);

    if (!conversation) {
      channel = await twilioClient.chat.v2
        .services(chatServiceSid)
        .channels(channelSid)
        .fetch();
    }

    const channelAttributes = JSON.parse((conversation || channel).attributes);

    await chatbotCallbackCleanup({
      accountSid,
      twilioClient,
      twilioWorkspaceSid,
      channel,
      conversation,
      channelAttributes,
    });

    return newOk({});
  } catch (error: any) {
    console.error('handleChatbotCallbackCleanup', error);
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
