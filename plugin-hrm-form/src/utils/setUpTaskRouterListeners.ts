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

import { Manager, TaskHelper, StateHelper, ITask } from '@twilio/flex-ui';
import type { Conversation } from '@twilio/conversations';

import { FeatureFlags } from '../types/types';
import * as TransferHelpers from './transfer';

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

const removeConversationListenersForTask = (task: ITask) => {
  if (TaskHelper.isChatBasedTask(task)) {
    const conversationState = StateHelper.getConversationStateForTask(task);

    removeConversationListeners(conversationState.source);
  }
};

const removeConversationListenersForTransferred = async (task: ITask) => {
  try {
    if (
      TaskHelper.isChatBasedTask(task) &&
      TransferHelpers.hasTransferStarted(task) &&
      !TransferHelpers.hasTaskControl(task)
    ) {
      const manager = Manager.getInstance();

      const conversation = await manager.conversationsClient.getConversationBySid(
        task.attributes.transferMeta.originalConversationSid,
      );

      removeConversationListeners(conversation);
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
  }

  /**
   * If transfers are on, after a task is transferred remove all the conversation listeners to prevent message notifications
   */
  if (featureFlags.enable_transfers) {
    manager.events.addListener('taskCompleted', removeConversationListenersForTransferred);
  }
};
