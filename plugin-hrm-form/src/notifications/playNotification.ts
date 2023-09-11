import { AudioPlayerError, AudioPlayerManager } from '@twilio/flex-ui';

import { getHrmConfig } from '../hrmConfig';

export const playNotification = (notificationTone: string) => {
  const { assetsBucketUrl } = getHrmConfig();

  const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;

  return AudioPlayerManager.play(
    {
      url: notificationUrl,
      repeatable: false,
    },
    (error: AudioPlayerError) => {
      console.log('AudioPlayerError:', error);
    },
  );
};
