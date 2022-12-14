import { Manager, TaskHelper, StateHelper, ITask } from '@twilio/flex-ui';

import type { SetupObject } from '../HrmFormPlugin';

const removeConversationListeners = (task: ITask) => {
  if (TaskHelper.isChatBasedTask(task)) {
    const conversationState = StateHelper.getConversationStateForTask(task);

    const safelyRemoveListeners = (eventName: string) => {
      try {
        if (conversationState.source?.listenerCount(eventName)) {
          conversationState.source?.removeAllListeners(eventName);
          console.log('>>>>>>>>>>>>>>', 'safely removed listeners for event ', eventName);
        }
      } catch (err) {
        console.error(`Failed to safelyRemoveListeners with event ${eventName}`, err);
      }
    };

    conversationState.source?.eventNames().forEach(safelyRemoveListeners);
  }
};

export const setTaskWrapupEventListeners = ({ featureFlags }: SetupObject) => {
  /*
   * If post surveys are on, remove all listeners from the underlying conversation on task wrapup.
   * This is done to hide any further activity between the contact and the post survey chatbot.
   */
  if (featureFlags.enable_post_survey) {
    const manager = Manager.getInstance();
    manager.events.addListener('taskWrapup', removeConversationListeners);
  }
};
