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

import { FeatureFlags } from '../types/types';

const removeConversationListeners = (task: ITask) => {
  if (TaskHelper.isChatBasedTask(task)) {
    const conversationState = StateHelper.getConversationStateForTask(task);

    const safelyRemoveListeners = (eventName: string) => {
      try {
        if (conversationState.source?.listenerCount(eventName)) {
          conversationState.source?.removeAllListeners(eventName);
        }
      } catch (err) {
        console.error(`Failed to safelyRemoveListeners with event ${eventName}`, err);
      }
    };

    conversationState.source?.eventNames().forEach(safelyRemoveListeners);
  }
};

export const setTaskWrapupEventListeners = (featureFlags: FeatureFlags) => {
  /*
   * If post surveys are on, remove all listeners from the underlying conversation on task wrapup.
   * This is done to hide any further activity between the contact and the post survey chatbot.
   */
  if (featureFlags.enable_post_survey) {
    const manager = Manager.getInstance();
    manager.events.addListener('taskWrapup', removeConversationListeners);
  }
};
