import * as Flex from '@twilio/flex-ui';

const manager = Flex.Manager.getInstance();
const assetsUrl = manager.serviceConfiguration.attributes.assets_bucket_url;

let media;

export const notifyReservedTask = reservation => {
  const notificationTone = 'ringtone';
  const notificationUrl = `${assetsUrl}/notifications/${notificationTone}.mp3`;
  if (document.visibilityState === 'visible') {
    media = Flex.AudioPlayerManager.play({
      url: notificationUrl,
      repeatable: true,
    });
  }
  const reservationStatuses = ['accepted', 'canceled', 'rejected', 'rescinded', 'timeout'];
  reservationStatuses.forEach(status => {
    reservation.once(status, () => {
      Flex.AudioPlayerManager.stop(media);
    });
  });
};

// Notifies when new task is
export const notifyNewMessae = () => {
  const notificationTone = 'bell';
  const notificationUrl = `${assetsUrl}/notifications/${notificationTone}.mp3`;

  manager.conversationsClient.on('messageAdded', messageInstance => {
  if (!messageInstance || messageInstance === undefined) return;
    if (messageInstance && document.visibilityState === 'visible') {
      Flex.AudioPlayerManager.play({
        url: notificationUrl,
        repeatable: false,
      });
    }
  });
};
