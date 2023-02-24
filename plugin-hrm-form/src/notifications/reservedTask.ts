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

import { Manager, AudioPlayerManager, AudioPlayerError } from '@twilio/flex-ui';

import { isTwilioTask } from '../types/types';
import { getHrmConfig } from '../hrmConfig';

const reservedTaskMedias: { [reservationSid: string]: string } = {};

export const subscribeReservedTaskAlert = () => {
  const manager = Manager.getInstance();
  manager.workerClient.on('reservationCreated', notifyReservedTask);
};

const notifyReservedTask = reservation => {
  try {
    if (isTwilioTask(reservation.task)) {
      const { assetsBucketUrl } = getHrmConfig();

      const notificationTone = 'ringtone';
      const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;

      playWhilePending(reservation, notificationUrl);
    }
  } catch (error) {
    console.error('Error in notifyReservedTask:', error);
  }
};

const playWhilePending = (reservation: { sid: string; status: string }, notificationUrl: string) => {
  const playNotificationIfPending = () => {
    if (reservation.status === 'pending') {
      const mediaId = AudioPlayerManager.play(
        {
          url: notificationUrl,
          repeatable: false,
        },
        (error: AudioPlayerError) => {
          console.log('AudioPlayerError:', error);
        },
      );

      reservedTaskMedias[reservation.sid] = mediaId;
      setTimeout(playNotificationIfPending, 500);
    }
  };

  playNotificationIfPending();
};
