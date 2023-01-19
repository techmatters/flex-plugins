import * as Flex from '@twilio/flex-ui';

/**
 * An audio alert when a task is reserved to the counsellor. Stops when accepted or other event that changes the worker or task status
 */
export const notifyReservedTask = reservation => {
  let media;
  const manager = Flex.Manager.getInstance();
  const assetsBucketUrl = manager.serviceConfiguration.attributes.assets_bucket_url;

  const notificationTone = 'ringtone';
  const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;

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
export const notifyNewMessage = messageInstance => {
  const manager = Flex.Manager.getInstance();
  const assetsBucketUrl = manager.serviceConfiguration.attributes.assets_bucket_url;

  const notificationTone = 'bell';
  const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;

  if (messageInstance && document.visibilityState === 'visible') {
    Flex.AudioPlayerManager.play({
      url: notificationUrl,
      repeatable: false,
    });
  }
};
