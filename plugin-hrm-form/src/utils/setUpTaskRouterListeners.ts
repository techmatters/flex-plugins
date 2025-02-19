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

import { Manager, StateHelper, TaskHelper } from '@twilio/flex-ui';
import type { Conversation } from '@twilio/conversations';

import { FeatureFlags } from '../types/types';
import * as TransferHelpers from '../transfer/transferTaskState';
import { deactivateAseloListeners } from '../conversationListeners';

const removeConversationListeners = (conversation: Conversation) => {
  const safelyRemoveListeners = (eventName: string) => {
    try {
      if (conversation.listenerCount(eventName)) {
        conversation.removeAllListeners(eventName);
      }
    } catch (err) {
      console.error(`Failed to safelyRemoveListeners with event ${eventName}`, err);
    }
  };

  conversation.eventNames().forEach(safelyRemoveListeners);
};

const runCallbackIfChatBasedTask = (callback: (conversation: Conversation) => void) => (task: ITask) => {
  if (TaskHelper.isChatBasedTask(task)) {
    const conversationState = StateHelper.getConversationStateForTask(task);

    // eslint-disable-next-line callback-return
    callback(conversationState.source);
  }
};

const removeParticipantLeftConversationListeners = runCallbackIfChatBasedTask((conversation: Conversation) => {
  conversation.removeAllListeners('participantLeft');
});
const removeConversationListenersForTask = runCallbackIfChatBasedTask(removeConversationListeners);

const deactivateConversationListenersForTransferred = async (task: ITask) => {
  try {
    if (
      TaskHelper.isChatBasedTask(task) &&
      TransferHelpers.hasTransferStarted(task) &&
      !TransferHelpers.hasTaskControl(task)
    ) {
      const manager = Manager.getInstance();

      const conversation = await manager.conversationsClient.peekConversationBySid(
        task.attributes.transferMeta.originalConversationSid,
      );

      deactivateAseloListeners(conversation);
    }
  } catch (err) {
    console.error('Error trying to run taskComplete taskrouter listener', err);
  }
};

export const setTaskWrapupEventListeners = (featureFlags: FeatureFlags) => {
  const manager = Manager.getInstance();
  /*
   * If post surveys are on, remove all listeners from the underlying conversation on task wrapup.
   * This is done to hide any further activity between the contact and the post survey chatbot.
   */
  if (featureFlags.enable_post_survey) {
    manager.events.addListener('taskWrapup', removeConversationListenersForTask);
  } else {
    // prevent weird bug when task is wrapped outside from Flex, where the chat history disappears
    manager.events.addListener('taskWrapup', removeParticipantLeftConversationListeners);
  }

  /**
   * If transfers are on, after a task is transferred remove all the conversation listeners to prevent message notifications
   */
  manager.events.addListener('taskCompleted', deactivateConversationListenersForTransferred);
};
