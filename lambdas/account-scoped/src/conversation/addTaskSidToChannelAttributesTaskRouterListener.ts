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
import { EventFields } from '../taskrouter';
import {
  registerTaskRouterEventHandler,
  TaskRouterEventHandler,
} from '../taskrouter/taskrouterEventHandler';
import { AccountSID, ChatServiceSID, TaskSID, WorkspaceSID } from '../twilioTypes';
import { Twilio } from 'twilio';
import { getSsmParameter } from '../ssmCache';
import { retrieveFeatureFlags } from '../configuration/flexConfiguration';
import { TASK_CREATED } from '../taskrouter/eventTypes';

type RelevantTaskAttributes = {
  isContactlessTask?: boolean;
  channelType?: string;
  customChannelType?: string;
};

const isTaskThatNeedsToBeAddedToChannelAttributes = async (
  taskSid: TaskSID,
  { isContactlessTask, channelType, customChannelType }: RelevantTaskAttributes,
  client: Twilio,
): Promise<boolean> => {
  if (isContactlessTask || (channelType || customChannelType) !== 'web') {
    console.debug(
      `Task ${taskSid} not suitable to add to channel attributes, isContactlessTask: ${isContactlessTask}, channelType: ${channelType}, customChannelType: ${customChannelType}`,
    );
    return false;
  }

  const { lambda_task_created_handler: lambdaTaskCreatedHandler } =
    await retrieveFeatureFlags(client);
  if (!lambdaTaskCreatedHandler) {
    console.debug(
      `Feature flag lambda_task_created_handler is enabled. Skipping addTaskSidToChannelAttributes for ${taskSid}, it will be handled in Twilio Serverless.`,
    );
    return false;
  }
  return true;
};

const addTaskSidToChannelAttributes: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
  client: Twilio,
) => {
  console.debug('addTaskSidToChannelAttributes execution starts');
  const { TaskSid, TaskAttributes } = event;

  if (TaskSid === undefined) {
    throw new Error('TaskSid missing in event object');
  }

  const taskSid = TaskSid as TaskSID;
  const eventTaskAttributes = JSON.parse(TaskAttributes);

  if (
    !(await isTaskThatNeedsToBeAddedToChannelAttributes(
      taskSid,
      eventTaskAttributes,
      client,
    ))
  ) {
    return;
  }

  const [workspaceSid, chatServiceSid] = await Promise.all([
    (await getSsmParameter(
      `${process.env.NODE_ENV}/twilio/${accountSid}/workspace_sid`,
    )) as WorkspaceSID,
    (await getSsmParameter(
      `${process.env.NODE_ENV}/twilio/${accountSid}/chat_service_sid`,
    )) as ChatServiceSID,
  ]);

  const task = await client.taskrouter.v1.workspaces(workspaceSid).tasks(TaskSid).fetch();

  const { channelSid, conversationSid } = JSON.parse(task.attributes);

  if (conversationSid) {
    // Fetch channel to update with a taskId
    const conversation = await client.conversations.v1
      .conversations(conversationSid)
      .fetch();

    const conversationAttributes = JSON.parse(conversation.attributes);

    const updatedConversation = await conversation.update({
      attributes: JSON.stringify({
        ...conversationAttributes,
        tasksSids:
          conversationAttributes.tasksSids &&
          Array.isArray(conversationAttributes.tasksSids)
            ? [...conversationAttributes.tasksSids, task.sid]
            : [task.sid],
      }),
    });

    console.info(
      `Conversation ${updatedConversation.sid} is updated with taskSid ${task.sid}`,
    );
    return;
  }

  // Fetch channel to update with a taskId
  const channel = await client.chat.v2
    .services(chatServiceSid)
    .channels(channelSid)
    .fetch();

  const channelAttributes = JSON.parse(channel.attributes);

  const updatedChannel = await channel.update({
    attributes: JSON.stringify({
      ...channelAttributes,
      tasksSids:
        channelAttributes.tasksSids && Array.isArray(channelAttributes.tasksSids)
          ? [...channelAttributes.tasksSids, task.sid]
          : [task.sid],
    }),
  });
  console.info(`Channel ${updatedChannel.sid} is updated with taskSid ${task.sid}`);
};

registerTaskRouterEventHandler([TASK_CREATED], addTaskSidToChannelAttributes);
