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
import { getAseloFeatureFlags } from '../hrmConfig';

const reservedTaskMedias: { [reservationSid: string]: string } = {};

export const subscribeReservedTaskAlert = () => {
  const { disable_reserved_task_notification: disableReservedTaskNotification } = getAseloFeatureFlags();
  if (disableReservedTaskNotification) return;

  const manager = Manager.getInstance();
  manager.workerClient.on('reservationCreated', notifyReservedTask);
};

const notifyReservedTask = reservation => {
  try {
    if (isTwilioTask(reservation.task)) {
      playWhilePending(reservation);
    }
  } catch (error) {
    console.error('Error in notifyReservedTask:', error);
  }
};

const playWhilePending = (reservation: { sid: string; status: string }) => {
  const playNotificationIfPending = () => {
    if (reservation.status === 'pending') {
      const notificationTone = 'ringtone';

      const mediaId = playNotification(notificationTone);

      reservedTaskMedias[reservation.sid] = mediaId;
      setTimeout(playNotificationIfPending, 3000);
    }
  };

  playNotificationIfPending();
};
