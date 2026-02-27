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

import type {
  AccountSID,
  ChatChannelSID,
  ConversationSID,
} from '@tech-matters/twilio-types';
import {
  getChatServiceSid,
  getTwilioClient,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { newErr, newOk } from '../Result';
import type { Result } from '../Result';
import type { HttpError } from '../httpTypes';
import type { FlexValidatedHandler } from '../validation/flexToken';

export type SendSystemMessageBody = (
  | { channelSid: ChatChannelSID; conversationSid?: ConversationSID; taskSid?: string }
  | { channelSid?: ChatChannelSID; conversationSid: ConversationSID; taskSid?: string }
  | { channelSid?: ChatChannelSID; conversationSid?: ConversationSID; taskSid: string }
) & {
  message?: string;
  from?: string;
};

export const sendSystemMessage = async (
  accountSid: AccountSID,
  event: SendSystemMessageBody,
): Promise<Result<HttpError, any>> => {
  const { taskSid, channelSid, conversationSid, message, from } = event;

  console.log('------ sendSystemMessage execution ------');

  if (!channelSid && !taskSid && !conversationSid) {
    return newErr({
      message:
        'none of taskSid, channelSid, or conversationSid provided, exactly one expected.',
      error: { statusCode: 400 },
    });
  }

  if (message === undefined) {
    return newErr({ message: 'missing message.', error: { statusCode: 400 } });
  }

  const client = await getTwilioClient(accountSid);

  let channelSidToMessage: ChatChannelSID | null = null;
  let conversationSidToMessage: ConversationSID | null = null;

  if (channelSid) {
    channelSidToMessage = channelSid;
  } else if (conversationSid) {
    conversationSidToMessage = conversationSid;
  } else if (taskSid) {
    const workspaceSid = await getWorkspaceSid(accountSid);
    const task = await client.taskrouter.v1.workspaces
      .get(workspaceSid)
      .tasks.get(taskSid)
      .fetch();
    const taskAttributes = JSON.parse(task.attributes);
    const { channelSid: taskChannelSid, conversationSid: taskConversationSid } =
      taskAttributes;
    channelSidToMessage = taskChannelSid ?? null;
    conversationSidToMessage = taskConversationSid ?? null;
  }

  if (conversationSidToMessage) {
    console.log(
      `Adding message "${message}" to conversation ${conversationSidToMessage}`,
    );
    const messageResult = await client.conversations.v1.conversations
      .get(conversationSidToMessage)
      .messages.create({
        body: message,
        author: from,
        xTwilioWebhookEnabled: 'true',
      });
    return newOk(messageResult);
  }

  if (channelSidToMessage) {
    console.log(`Sending message "${message}" to channel ${channelSidToMessage}`);
    const chatServiceSid = await getChatServiceSid(accountSid);
    const messageResult = await client.chat.v2.services
      .get(chatServiceSid)
      .channels.get(channelSidToMessage)
      .messages.create({
        body: message,
        from,
        xTwilioWebhookEnabled: 'true',
      });
    return newOk(messageResult);
  }

  return newErr({
    message:
      'Conversation or Chat Channel SID were not provided directly or specified on the provided task',
    error: { statusCode: 400 },
  });
};

export const sendSystemMessageHandler: FlexValidatedHandler = async (
  { body },
  accountSid,
) => {
  try {
    return await sendSystemMessage(accountSid, body as SendSystemMessageBody);
  } catch (err: any) {
    return newErr({ message: err.message, error: { statusCode: 500, cause: err } });
  }
};
