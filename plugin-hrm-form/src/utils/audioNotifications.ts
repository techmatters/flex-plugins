import * as Flex from '@twilio/flex-ui';
// import type { Worker } from 'twilio-taskrouter';

import { getConfig } from '../hrmConfig';

/**
 * An audio alert when a task is reserved to the counsellor. Stops when accepted or other event that changes the worker or task status
 */
const { assetsBucketUrl } = getConfig();
export const notifyReservedTask = reservation => {
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

/**
 * An audio alert when a counsellor receives a  new message
 */
export const notifyNewMessage = (messageInstance, task) => {
  console.log('>>> TaskHelper.isChatBasedTask(task)', Flex.TaskHelper.isChatBasedTask(task));
  console.log('>>> StateHelper.getConversationStateForTask(task)', Flex.StateHelper.getConversationStateForTask(task));
  const manager = Flex.Manager.getInstance();
  const { assetsBucketUrl } = getConfig();

  const notificationTone = 'bell';
  const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;

  // normalizeEmail changes messageInstance.author which is an encoded property of messageInstance to email with @ and .
  const normalizeEmail = (identity: string) => identity.replace('_2E', '.').replace('_40', '@');

  console.log('>>> manager user identity', manager.user.identity);
  console.log('>>> manager user identity', manager.store.getState());

  // console.log('>>> Flex.Manager.getInstance().store.getState().flex.session', Flex.Manager.getInstance().store.getState().flex)

  console.log('>>> messageInstance author', messageInstance.author);
  console.log('>>> messageInstance', messageInstance);

  const isCounsellor = normalizeEmail(manager.user.identity) === normalizeEmail(messageInstance.author);
  if (!isCounsellor && document.visibilityState === 'visible') {
    Flex.AudioPlayerManager.play({
      url: notificationUrl,
      repeatable: false,
    });
  }
};
