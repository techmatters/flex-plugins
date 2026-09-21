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

import { Manager } from '@twilio/flex-ui';

import { isTwilioTask } from '../types/types';
import { playNotification } from './playNotification';

const NOTIFICATION_TONE = 'ringtone';

export const subscribeReservedTaskAlert = () => {
  const manager = Manager.getInstance();
  manager.workerClient.on('reservationCreated', notifyReservedTask);
  setInterval(playNotificationIfPending, 3000);
};

let repeatingNotificationPlaying = false;

const notifyReservedTask = reservation => {
  try {
    if (isTwilioTask(reservation.task) && !repeatingNotificationPlaying) {
      playNotification(NOTIFICATION_TONE);
    }
  } catch (error) {
    console.error('Error in notifyReservedTask:', error);
  }
};

const playNotificationIfPending = () => {
  const pendingReservations = Manager.getInstance()
    .workerClient.reservations.values()
    .filter(({ status }) => status === 'pending')
    .toArray();
  if (pendingReservations.length > 0) {
    playNotification(NOTIFICATION_TONE);
    repeatingNotificationPlaying = true;
    if (pendingReservations.length > 1) {
      // Play a double notification if there are multiple reservations pending
      playNotification(NOTIFICATION_TONE);
    }
  } else {
    repeatingNotificationPlaying = false;
  }
};
