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
import { AccountSID, TaskSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import { TASK_CREATED } from '../taskrouter/eventTypes';
import { getChatServiceSid, getWorkspaceSid } from '@tech-matters/twilio-configuration';

type RelevantTaskAttributes = {
  isContactlessTask?: boolean;
};

const isTaskThatNeedsToBeAddedToChannelAttributes = async (
  taskSid: TaskSID,
  taskChannelUniqueName: string,
  { isContactlessTask }: RelevantTaskAttributes,
): Promise<boolean> => {
  if (isContactlessTask || taskChannelUniqueName !== 'chat') {
    console.debug(
      `Task ${taskSid} not suitable to add to channel attributes, isContactlessTask: ${isContactlessTask}, taskChannelUniqueName: ${taskChannelUniqueName}`,
    );
    return false;
  }

  return true;
};

export const addTaskSidToChannelAttributes: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
  client: Twilio,
) => {
  console.debug('addTaskSidToChannelAttributes execution starts');
  const { TaskSid, TaskAttributes, TaskChannelUniqueName: taskChannelUniqueName } = event;

  if (TaskSid === undefined) {
    throw new Error('TaskSid missing in event object');
  }

  const taskSid = TaskSid as TaskSID;
  const eventTaskAttributes = JSON.parse(TaskAttributes);

  if (
    !(await isTaskThatNeedsToBeAddedToChannelAttributes(
      taskSid,
      taskChannelUniqueName,
      eventTaskAttributes,
    ))
  ) {
    return;
  }

  const [workspaceSid, chatServiceSid] = await Promise.all([
    await getWorkspaceSid(accountSid),
    await getChatServiceSid(accountSid),
  ]);

  const task = await client.taskrouter.v1.workspaces
    .get(workspaceSid)
    .tasks.get(TaskSid)
    .fetch();

  const { channelSid, conversationSid } = JSON.parse(task.attributes);

  if (conversationSid) {
    // Fetch channel to update with a taskId
    const conversation = await client.conversations.v1.conversations
      .get(conversationSid)
      .fetch();

    if (conversation.state === 'closed') {
      console.warn(
        `Attempting to add taskSid ${TaskSid} to closed conversation ${conversationSid}, closed conversations cannot be updated.`,
      );
      return;
    }

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
  const channel = await client.chat.v2.services
    .get(chatServiceSid)
    .channels.get(channelSid)
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
