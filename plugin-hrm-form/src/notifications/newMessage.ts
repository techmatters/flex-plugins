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

import { Manager, StateHelper, AudioPlayerManager, AudioPlayerError } from '@twilio/flex-ui';
import { Conversation } from '@twilio/conversations';

import { getHrmConfig } from '../hrmConfig';

export const subscribeAlertOnConversationJoined = task => {
  const manager = Manager.getInstance();
  manager.conversationsClient.once('conversationJoined', () => trySubscribeAudioAlerts(task, 0, 0));
};

export const subscribeNewMessageAlertOnPluginInit = () => {
  const manager = Manager.getInstance();
  const { tasks } = manager.store.getState().flex.worker;
  tasks.forEach(task => trySubscribeAudioAlerts(task, 0, 0));
};

const subscribeAlertOnNewMessage = (conversation: Conversation) => {
  conversation.on('messageAdded', notifyNewMessage);
};

const trySubscribeAudioAlerts = (task, ms: number, retries: number) => {
  setTimeout(() => {
    const convoState = StateHelper.getConversationStateForTask(task);

    // if channel is not ready, wait 200ms and retry
    if (convoState?.isLoadingConversation) {
      if (retries < 10) trySubscribeAudioAlerts(task, 200, retries + 1);
      else console.error('Failed to subscribe audio alerts: max retries reached.');
    } else {
      subscribeAlertOnNewMessage(convoState?.source);
    }
  }, ms);
};

const notifyNewMessage = messageInstance => {
  try {
    const manager = Manager.getInstance();
    const { assetsBucketUrl } = getHrmConfig();

    const notificationTone = 'bell';
    const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;

    const isCounsellor = manager.conversationsClient.user.identity === messageInstance.author;
    if (!isCounsellor && document.visibilityState === 'hidden') {
      AudioPlayerManager.play(
        {
          url: notificationUrl,
          repeatable: false,
        },
        (error: AudioPlayerError) => {
          console.log('AudioPlayerError:', error);
        },
      );
    }
  } catch (error) {
    console.error('Error in notifyNewMessage:', error);
  }
};
