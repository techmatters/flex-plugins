/**
 * Copyright (C) 2021-2026 Technology Matters
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

const NOTIFICATION_TONE = 'bell';

export const requestNotificationPermission = async (): Promise<void> => {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

export const showBrowserNotification = (title: string, body: string): void => {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return;
  }
  try {
    // eslint-disable-next-line no-new
    new Notification(title, { body });
  } catch (err) {
    console.error('Failed to show browser notification:', err);
  }
};

export const playNotificationSound = (assetsBucketUrl: string): void => {
  try {
    const audio = new Audio(`${assetsBucketUrl}/notifications/${NOTIFICATION_TONE}.mp3`);
    audio.play().catch(err => {
      console.error('Failed to play notification sound:', err);
    });
  } catch (err) {
    console.error('Failed to create notification audio:', err);
  }
};

export const getAssetsBucketUrl = (environment: string): string =>
  `https://assets-${environment}.tl.techmatters.org/plugins/hrm`;
