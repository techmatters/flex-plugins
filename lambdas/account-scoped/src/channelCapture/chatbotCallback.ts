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
import { ChannelInstance } from 'twilio/lib/rest/chat/v2/service/channel';
import { ConversationInstance } from 'twilio/lib/rest/conversations/v1/conversation';
import type { CapturedChannelAttributes } from './channelCaptureHandlers';
import { AccountScopedHandler, HttpError } from '../httpTypes';
import { isErr, newErr, newOk, Result } from '../Result';
import {
  getAccountAuthToken,
  getChatServiceSid,
  getWorkspaceSid,
} from '../configuration/twilioConfiguration';
import { LexClient } from './lexClient';
import { chatbotCallbackCleanup } from './chatbotCallbackCleanup';

export const handleChatbotCallback: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, {}>> => {
  console.log('===== chatbotCallback handler =====');

  try {
    const { Body, From, ChannelSid, EventType, ParticipantSid, ConversationSid } =
      request.body;

    if (!Body) {
      return newErr({
        message: 'Missing Body parameter',
        error: { statusCode: 400, cause: new Error('Missing Body parameter') },
      });
    }
    if (!From && !ConversationSid) {
      return newErr({
        message: 'Missing From parameter',
        error: { statusCode: 400, cause: new Error('Missing channelSid parameter') },
      });
    }
    if (!ChannelSid && !ConversationSid) {
      return newErr({
        message: 'Missing ChannelSid or ConversationSid parameter',
        error: { statusCode: 400, cause: new Error('Missing channelSid parameter') },
      });
    }
    if (!EventType) {
      return newErr({
        message: 'Missing EventType parameter',
        error: { statusCode: 400, cause: new Error('Missing channelSid parameter') },
      });
    }

    const authToken = await getAccountAuthToken(accountSid);
    const twilioClient = twilio(accountSid, authToken);

    let conversation: ConversationInstance | undefined;
    let channel: ChannelInstance | undefined;
    let attributesJson: string | undefined;

    if (ConversationSid) {
      try {
        conversation = await twilioClient.conversations.v1
          .conversations(String(ConversationSid))
          .fetch();
        attributesJson = conversation.attributes;
      } catch (err) {
        console.log(`Could not fetch conversation with sid ${ConversationSid}`);
      }
    }

    if (ChannelSid) {
      const chatServiceSid = await getChatServiceSid(accountSid);
      try {
        channel = await twilioClient.chat.v2
          .services(chatServiceSid)
          .channels(ChannelSid)
          .fetch();
        attributesJson = channel.attributes;
      } catch (err) {
        console.log(`Could not fetch channel with sid ${ChannelSid}`);
      }
    }

    if (!channel && !conversation) {
      const message = `Could not fetch channel or conversation with sid ${ChannelSid} or ${String(
        ConversationSid,
      )}`;

      console.error(message);
      return newErr({
        message,
        error: { statusCode: 500, cause: new Error(message) },
      });
    }

    console.log('conversation / channel attributes:', attributesJson);

    const channelAttributes = JSON.parse(attributesJson || '{}');

    // Send message to bot only if it's from child
    const eventTypeCheck =
      EventType === 'onMessageSent' || EventType === 'onMessageAdded';
    const userIdentityCheck =
      (From && channelAttributes.serviceUserIdentity === From) ||
      (ParticipantSid && channelAttributes.participantSid === ParticipantSid);

    if (eventTypeCheck && userIdentityCheck) {
      const capturedChannelAttributes =
        channelAttributes.capturedChannelAttributes as CapturedChannelAttributes;

      const {
        botLanguage,
        botLanguageV1,
        botSuffix,
        enableLexV2,
        environment,
        helplineCode,
        userId,
      } = capturedChannelAttributes;

      const lexResult = await LexClient.postText({
        enableLexV2,
        postTextParams: {
          botLanguage,
          botLanguageV1,
          botSuffix,
          environment,
          helplineCode,
          inputText: Body,
          sessionId: userId,
        },
      });

      if (isErr(lexResult)) {
        if (
          lexResult.error instanceof Error &&
          lexResult.error.message.includes(
            'Concurrent Client Requests: Encountered resource conflict while saving session data',
          )
        ) {
          console.log('Swallowed Concurrent Client Requests error');
          return newOk({});
        }

        throw lexResult.error;
      }

      const twilioWorkspaceSid = await getWorkspaceSid(accountSid);

      const { lexResponse, lexVersion } = lexResult.data;
      // If the session ended, we should unlock the channel to continue the Studio Flow
      if (LexClient.isEndOfDialog({ enableLexV2, lexResponse })) {
        await chatbotCallbackCleanup({
          accountSid,
          twilioClient,
          conversation,
          channel,
          channelAttributes,
          memory: LexClient.getBotMemory({ enableLexV2, lexResponse }),
          twilioWorkspaceSid,
        });
      }

      // TODO: unify with functions/channelCapture/channelCaptureHandlers.private.ts
      let messages: string[] = [];
      if (lexVersion === 'v1') {
        messages.push(lexResponse.message || '');
      } else if (lexVersion === 'v2' && lexResponse.messages) {
        messages = messages.concat(lexResponse.messages.map(m => m.content || ''));
      }

      // TODO: unify with functions/channelCapture/channelCaptureHandlers.private.ts
      for (const message of messages) {
        if (conversation) {
          // eslint-disable-next-line no-await-in-loop
          await conversation.messages().create({
            body: message,
            author: 'Bot',
            xTwilioWebhookEnabled: 'true',
          });
        } else {
          // eslint-disable-next-line no-await-in-loop
          await channel?.messages().create({
            body: message,
            from: 'Bot',
            xTwilioWebhookEnabled: 'true',
          });
        }
      }

      return newOk({});
    }

    console.info('Event ignored');
    return newOk({});
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
