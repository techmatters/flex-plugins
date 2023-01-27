import * as Flex from '@twilio/flex-ui';
import { Conversation } from '@twilio/conversations';

import { getHrmConfig } from '../hrmConfig';

const trySubscribeAudioAlerts = (task, ms: number, retries: number) => {
  setTimeout(() => {
    const convoState = Flex.StateHelper.getConversationStateForTask(task);

    // if channel is not ready, wait 200ms and retry
    if (convoState.isLoadingConversation) {
      if (retries < 10) trySubscribeAudioAlerts(task, 200, retries + 1);
      else console.error('Failed to subscribe audio alerts: max retries reached.');
    } else {
      subscribeAlertOnNewMessage(convoState.source);
    }
  }, ms);
};

export const subscribeAlertOnConversationJoined = task => {
  const manager = Flex.Manager.getInstance();
  manager.conversationsClient.once('conversationJoined', (c: Conversation) => trySubscribeAudioAlerts(task, 0, 0));
};

export const subscribeNewMessageAlertOnPluginInit = () => {
  const { tasks } = Flex.Manager.getInstance().store.getState().flex.worker;
  tasks.forEach(task => trySubscribeAudioAlerts(task, 0, 0));
};

const subscribeAlertOnNewMessage = (conversation: Conversation) => {
  conversation.on('messageAdded', notifyNewMessage);
};

const notifyNewMessage = messageInstance => {
  const manager = Flex.Manager.getInstance();
  const { assetsBucketUrl } = getHrmConfig();

  const notificationTone = 'bell';
  const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;

  // normalizeEmail transforms an encoded characters with @ and .
  const normalizeEmail = (identity: string) => identity.replace('_2E', '.').replace('_40', '@');

  const isCounsellor = normalizeEmail(manager.user.identity) === normalizeEmail(messageInstance.author);
  if (!isCounsellor && document.visibilityState === 'visible') {
    Flex.AudioPlayerManager.play({
      url: notificationUrl,
      repeatable: false,
    });
  }
};

const notifyReservedTask = reservation => {
  const { assetsBucketUrl } = getHrmConfig();

  const notificationTone = 'ringtone';
  const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;

  let media;

  if (document.visibilityState === 'visible') {
    media = Flex.AudioPlayerManager.play({
      url: notificationUrl,
      repeatable: true,
    });
  }
  const taskStatuses = ['accepted', 'canceled', 'rejected', 'rescinded', 'timeout'];
  taskStatuses.forEach(status => {
    reservation.once(status, () => {
      Flex.AudioPlayerManager.stop(media);
    });
  });
};

export const subscribeReservedTaskAlert = () => {
  const manager = Flex.Manager.getInstance();
  manager.workerClient.on('reservationCreated', notifyReservedTask);
};
