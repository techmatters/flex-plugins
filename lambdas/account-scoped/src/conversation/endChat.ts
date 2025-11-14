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

/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import '@twilio-labs/serverless-runtime-types';

import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { ChatChannelSID, ConversationSID } from '@tech-matters/twilio-types';
import { AccountScopedHandler, HttpError } from '../httpTypes';
import { AccountSID } from '@tech-matters/twilio-types';
import { newErr, newOk, Result } from '../Result';
import {
  getChatServiceSid,
  getTwilioClient,
  getTwilioWorkspaceSid,
} from '@tech-matters/twilio-configuration';
import { lookupCustomMessage } from '../hrm/formDefinitionsCache';
import { chatChannelJanitor } from './chatChannelJanitor';

export type EndChatRequestBody = {
  channelSid?: ChatChannelSID;
  conversationSid?: ConversationSID;
  language?: string;
};

const getEndChatMessage = async (
  accountSid: AccountSID,
  event: EndChatRequestBody,
): Promise<string> => {
  // Retrieve the EndChatMsg for appropriate language
  const { language: locale } = event;

  if (locale) {
    try {
      const customMessage = await lookupCustomMessage(accountSid, locale, 'EndChatMsg');
      if (customMessage) {
        return customMessage;
      }
      // We would typically look up 'standard translations' here, but none are currently set up
      // The message is always set as a custom message for the helpline
      console.info(`No custom EndChatMsg message set for ${locale} on ${accountSid}`);
    } catch (err) {
      console.warn(`Couldn't retrieve EndChatMsg message translation for ${locale}`, err);
    }
  }
  return 'User left the conversation';
};

/**
 * End a task by updating their assignment status.
 *
 * It also sends a message indicating that the user has left the conversation
 * if appropriate.
 *
 * @returns channelCleanupRequired
 */
const updateTaskAssignmentStatus = async (
  accountSid: AccountSID,
  taskSid: string,
  channelSid: string,
  event: EndChatRequestBody,
) => {
  try {
    const client = await getTwilioClient(accountSid);
    const workspaceSid = await getTwilioWorkspaceSid(accountSid);
    // Fetch the Task to 'cancel' or 'wrapup'
    const task = await client.taskrouter.v1.workspaces
      .get(workspaceSid)
      .tasks(taskSid)
      .fetch();

    // Send a Message indicating user left the conversation
    if (task.assignmentStatus === 'assigned') {
      const endChatMessage = await getEndChatMessage(accountSid, event);
      await client.chat.v2
        .services(await getChatServiceSid(accountSid))
        .channels(channelSid)
        .messages.create({
          body: endChatMessage,
          from: 'Bot',
          xTwilioWebhookEnabled: 'true',
        });
    }

    // Update the task assignmentStatus
    const updateAssignmentStatus = (assignmentStatus: TaskInstance['assignmentStatus']) =>
      client.taskrouter.v1
        .workspaces(workspaceSid)
        .tasks(taskSid)
        .update({ assignmentStatus });

    switch (task.assignmentStatus) {
      case 'reserved':
      case 'pending': {
        await updateAssignmentStatus('canceled');
        return 'cleanup'; // indicate that there's cleanup needed
      }
      case 'assigned': {
        await updateAssignmentStatus('wrapping');
        return 'keep-alive'; // keep the channel alive for post survey
      }
      // If the task is wrapping / complete, we assume the user is trying to end the post survey
      case 'wrapping':
      case 'completed': {
        return 'cleanup'; // only clean up, task doesn't need cancelling
      }
      default:
    }

    return 'noop'; // no action needed
  } catch (err) {
    console.warn(`Unable to end task ${taskSid}:`, err);
    return 'noop'; // no action needed
  }
};

/**
 * End contact task or post-survey task associated to the given channel.
 *
 * @returns channelCleanupRequired
 */
const endContactOrPostSurvey = async (
  accountSid: AccountSID,
  channelAttributes: any,
  event: EndChatRequestBody,
) => {
  const { tasksSids, surveyTaskSid } = channelAttributes;

  const { channelSid } = event;
  const actionsOnChannel = await Promise.allSettled(
    [...tasksSids, surveyTaskSid]
      .filter(Boolean)
      .map(tSid =>
        updateTaskAssignmentStatus(accountSid, tSid, channelSid as string, event),
      ),
  );

  // Cleanup the channel if there's no keep-alive and at least one cleanup
  return (
    !actionsOnChannel.some(p => p.status === 'fulfilled' && p.value === 'keep-alive') &&
    actionsOnChannel.some(p => p.status === 'fulfilled' && p.value === 'cleanup')
  );
};

export const handleEndChat: AccountScopedHandler = async (
  { body },
  accountSid: AccountSID,
): Promise<Result<HttpError, any>> => {
  try {
    const client = await getTwilioClient(accountSid);

    const { conversationSid, channelSid, language } = body as EndChatRequestBody;

    if (channelSid === undefined && conversationSid === undefined) {
      return newErr({
        message: 'Either a ChannelSid or ConversationSid parameter is required',
        error: { statusCode: 400 },
      });
    }
    if (language === undefined) {
      return newErr({
        message: 'language parameter is missing',
        error: { statusCode: 400 },
      });
    }

    let channelCleanupRequired;

    if (conversationSid) {
      const { attributes, participants } = await client.conversations.v1.conversations
        .get(conversationSid)
        .fetch();
      const conversationAttributes = JSON.parse(attributes);
      channelCleanupRequired = await endContactOrPostSurvey(
        accountSid,
        conversationAttributes,
        body,
      );
      const participantsList = await participants().list();
      await Promise.all(
        participantsList.map(async (p): Promise<boolean> => {
          if (JSON.parse(p.attributes).member_type !== 'guest') {
            return p.remove();
          }
          return false;
        }),
      );
    } else {
      const channelContext = client.chat.v2.services
        .get(await getChatServiceSid(accountSid))
        .channels.get(channelSid!);

      // Use the channelSid to fetch task that needs to be closed
      const channelAttributes = JSON.parse((await channelContext.fetch()).attributes);

      channelCleanupRequired = await endContactOrPostSurvey(
        accountSid,
        channelAttributes,
        body,
      );

      const channelMembers = await channelContext.members.list();
      await Promise.all(
        channelMembers.map(m => {
          if (JSON.parse(m.attributes).member_type !== 'guest') {
            return m.remove();
          }

          return Promise.resolve();
        }),
      );
    }

    if (channelCleanupRequired) {
      // Deactivate channel and proxy
      await chatChannelJanitor(accountSid, {
        channelSid,
        conversationSid: conversationSid!,
      });
    }

    return newOk({ message: 'End Chat OK!' });
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
