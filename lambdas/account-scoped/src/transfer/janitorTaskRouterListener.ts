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

import {
  registerTaskRouterEventHandler,
  TaskRouterEventHandler,
} from '../taskrouter/taskrouterEventHandler';
import { AccountSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import {
  EventType,
  TASK_CANCELED,
  TASK_COMPLETED,
  TASK_DELETED,
  TASK_SYSTEM_DELETED,
  TASK_WRAPUP,
} from '../taskrouter/eventTypes';
import { EventFields } from '../taskrouter';
import { retrieveFeatureFlags } from '../configuration/aseloConfiguration';
import { chatChannelJanitor } from '../conversation/chatChannelJanitor';
import { hasTaskControl } from './hasTaskControl';
import { isChatCaptureControlTask } from '../channelCapture/channelCaptureHandlers';
import { isAseloCustomChannel } from '../customChannels/customChannelToFlex';
import { getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { ChatChannelSID, ConversationSID } from '@tech-matters/twilio-types';

const isCleanupBotCapture = (
  eventType: EventType,
  taskAttributes: { isChatCaptureControl?: boolean },
) => eventType === TASK_CANCELED && isChatCaptureControlTask(taskAttributes);

const isHandledByOtherListener = async (
  client: Twilio,
  workspaceSid: string,
  taskSid: string,
  taskAttributes: { isChatCaptureControl?: boolean },
) => {
  if (isChatCaptureControlTask(taskAttributes)) {
    console.debug('isHandledByOtherListener? - Yes, isChatCaptureControl');
    return true;
  }
  const res = !(await hasTaskControl({ client, workspaceSid, taskSid }));
  if (res) {
    console.debug(
      'isHandledByOtherListener? - Yes, does not have task control',
      taskAttributes,
    );
  } else {
    console.debug('isHandledByOtherListener? - No, not handled by other listener');
  }
  return res;
};

const isCleanupCustomChannel = async (
  eventType: EventType,
  client: Twilio,
  workspaceSid: string,
  taskSid: string,
  taskAttributes: {
    channelType?: string;
    customChannelType?: string;
    isChatCaptureControl?: boolean;
  },
) => {
  if (![TASK_DELETED, TASK_SYSTEM_DELETED, TASK_CANCELED].includes(eventType as any)) {
    return false;
  }

  if (await isHandledByOtherListener(client, workspaceSid, taskSid, taskAttributes)) {
    return false;
  }

  return isAseloCustomChannel(
    taskAttributes.customChannelType || taskAttributes.channelType,
  );
};

const isDeactivateConversationOrchestration = async (
  eventType: EventType,
  client: Twilio,
  workspaceSid: string,
  taskSid: string,
  taskAttributes: { isChatCaptureControl?: boolean },
) => {
  console.debug('isDeactivateConversationOrchestration?');
  if (
    ![
      TASK_WRAPUP,
      TASK_COMPLETED,
      TASK_DELETED,
      TASK_SYSTEM_DELETED,
      TASK_CANCELED,
    ].includes(eventType as any)
  ) {
    console.debug(
      'isDeactivateConversationOrchestration? - No, wrong event type:',
      eventType,
    );
    return false;
  }

  if (await isHandledByOtherListener(client, workspaceSid, taskSid, taskAttributes)) {
    console.debug(
      'isDeactivateConversationOrchestration? - No, handled by other listener',
    );
    return false;
  }

  return true;
};

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const janitorHandler: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
  client: Twilio,
) => {
  const featureFlags = await retrieveFeatureFlags(client);

  if (!featureFlags.use_twilio_lambda_janitor) {
    console.log(
      '===== JanitorTaskRouterListener skipped - use_twilio_lambda_janitor flag not enabled =====',
    );
    return;
  }

  try {
    const {
      EventType: eventType,
      TaskAttributes: taskAttributesString,
      TaskSid: taskSid,
      TaskChannelUniqueName: taskChannelUniqueName,
    } = event;

    if (!['chat', 'survey'].includes(taskChannelUniqueName)) return;

    console.log(`===== Executing JanitorListener for event: ${eventType} =====`);

    if (taskChannelUniqueName === 'survey' && eventType !== TASK_CANCELED) {
      console.log(
        'Survey tasks are only handled by the channel janitor on task cancelled events skipping this one.',
        eventType,
      );
      return;
    }

    const taskAttributes = JSON.parse(taskAttributesString || '{}');
    const { channelSid, conversationSid } = taskAttributes;
    const workspaceSid = await getWorkspaceSid(accountSid);

    if (isCleanupBotCapture(eventType, taskAttributes)) {
      await wait(3000);

      await chatChannelJanitor(accountSid, {
        channelSid: channelSid as ChatChannelSID,
        conversationSid: conversationSid as ConversationSID,
      });

      console.log('Finished handling clean up.');
      return;
    }

    if (
      await isCleanupCustomChannel(
        eventType,
        client,
        workspaceSid,
        taskSid,
        taskAttributes,
      )
    ) {
      console.log('Handling clean up custom channel...');

      await chatChannelJanitor(accountSid, {
        channelSid: taskAttributes.channelSid as ChatChannelSID,
      });

      console.log('Finished handling clean up custom channel.');
      return;
    }

    if (
      await isDeactivateConversationOrchestration(
        eventType,
        client,
        workspaceSid,
        taskSid,
        taskAttributes,
      )
    ) {
      if (!featureFlags.enable_post_survey) {
        console.log('Handling DeactivateConversationOrchestration...');

        await chatChannelJanitor(accountSid, {
          channelSid: channelSid as ChatChannelSID,
          conversationSid: conversationSid as ConversationSID,
        });

        console.log('Finished DeactivateConversationOrchestration.');
        return;
      }
    }

    console.log('===== JanitorListener finished successfully =====');
  } catch (err) {
    console.log('===== JanitorListener has failed =====');
    console.log(String(err));
    throw err;
  }
};

registerTaskRouterEventHandler(
  [TASK_CANCELED, TASK_WRAPUP, TASK_COMPLETED, TASK_DELETED, TASK_SYSTEM_DELETED],
  janitorHandler,
);
