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

import { getHrmConfig } from '../hrmConfig';

/**
 * notifyReservedTask plays ringtone when an agent has a reserved task in pending state.
 *  The notification stops when the reservation is not longer in pending.
 *  There is a check, checkForPendingReservation, in case, notification does not stop as expected.
 *
 * @param reservation
 */
const notifyReservedTask = reservation => {
  try {
    const { assetsBucketUrl } = getHrmConfig();

    const notificationTone = 'ringtone';
    const notificationUrl = `${assetsBucketUrl}/notifications/${notificationTone}.mp3`;

    let media;

    if (document.visibilityState === 'visible') {
      media = AudioPlayerManager.play(
        {
          url: notificationUrl,
          repeatable: true,
        },
        (error: AudioPlayerError) => {
          console.log('AudioPlayerError:', error);
        },
      );
    }

    const stopAudio = () => media && AudioPlayerManager.stop(media);

    const reservationStatuses = ['accepted', 'canceled', 'rejected', 'rescinded', 'timeout'];
    reservationStatuses.forEach(status => reservation.on(status, stopAudio));

    const checkForPendingReservation = () =>
      reservation.status === 'pending' ? setTimeout(checkForPendingReservation, 5000) : stopAudio();
    checkForPendingReservation();
  } catch (error) {
    console.error('Error in notifyReservedTask:', error);
  }
};

export const subscribeReservedTaskAlert = () => {
  const manager = Manager.getInstance();
  manager.workerClient.on('reservationCreated', notifyReservedTask);
};
