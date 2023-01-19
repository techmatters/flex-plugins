import * as Flex from '@twilio/flex-ui';

const manager = Flex.Manager.getInstance();
const assetsUrl = manager.serviceConfiguration.attributes.assets_bucket_url;

let media;
const reservationStatuses = ['accepted', 'canceled', 'rejected', 'rescinded', 'timeout'];

const stopTone = media => {
  if (!media || media === undefined) return;
  if (document.visibilityState === 'visible') {
    Flex.AudioPlayerManager.stop(media);
    media = undefined;
  }
};
export const notifyReservedTask = reservation => {
  const notificationTone = 'ringtone';
  const notificationUrl = `${assetsUrl}/notifications/${notificationTone}.mp3`;
  if (document.visibilityState === 'visible') {
    media = Flex.AudioPlayerManager.play({
      url: notificationUrl,
      repeatable: true,
    });
  }

  reservationStatuses.forEach(status => {
    reservation.once(status, () => {
      stopTone(media);
    });
  });
};

// Notifies when new task is
export const notifyNewMessae = () => {
  const notificationTone = 'bell';
  const notificationUrl = `${assetsUrl}/notifications/${notificationTone}.mp3`;

  manager.conversationsClient.on('messageAdded', messageInstance => {
  if (!media || media === undefined) return;

    if (messageInstance && document.visibilityState === 'visible') {
      Flex.AudioPlayerManager.play({
        url: notificationUrl,
        repeatable: false,
      });
    }
  });
};
