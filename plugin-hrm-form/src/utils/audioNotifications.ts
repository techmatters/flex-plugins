import * as Flex from '@twilio/flex-ui';
import type { Worker } from 'twilio-taskrouter';

import { getConfig } from '../HrmFormPlugin';

const client: Worker = Flex.Manager.getInstance().workerClient;

client.on('reservationCreated', reservation => notifyReservedTask(reservation));

/**
 * An audio alert when a task is reserved to the counsellor. Stops when accepted or other event that changes the worker or task status
 */
export const notifyReservedTask = reservation => {
  const { assetsBucketUrl } = getConfig();

  const notificationTone = 'ringtone';
  const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;

  let media;

  if (document.visibilityState === 'visible') {
    console.log('>>>notifyReservedTask');
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
export const notifyNewMessage = messageInstance => {
  console.log('>>>notifyNewMessage');

  const manager = Flex.Manager.getInstance();
  const { assetsBucketUrl } = getConfig();

  const notificationTone = 'bell';
  const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;
  console.log('>>> messageInstance', messageInstance.author);
  /*
   * console.log('>>> manager.workerClient', manager.workerClient)
   * console.log('>>> manager.conversationsClient', manager.conversationsClient)
   */
  console.log('>>> messageInstance', manager.user.identity);
  const isCounsellor = manager.user.identity === messageInstance.author;
  if (!isCounsellor && document.visibilityState === 'visible') {
    Flex.AudioPlayerManager.play({
      url: notificationUrl,
      repeatable: false,
    });
  }
};
