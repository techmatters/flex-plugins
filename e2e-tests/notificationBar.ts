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

// eslint-disable-next-line import/no-extraneous-dependencies
import { Locator, Page, expect } from '@playwright/test';
import { saveDownloadAsArtifact } from './artifacts';

export const notificationBar = (page: Page) => {
  const selectors = {
    notification: page.locator("//div[@data-test='notification-container']"),
    notificationDismissButton: (notificationLocator: Locator) =>
      notificationLocator.locator('//button[@aria-label="Close notification"]'),
    notificationDownloadButton: (notificationLocator: Locator) =>
      notificationLocator.locator(
        '//button[@aria-label="DegradedNotificationDownloadReportAction  task"]',
      ),
    notificationMessage: (notificationLocator: Locator) =>
      notificationLocator.locator("//div[@data-test='notification-message']"),
  };

  return {
    dismissAllNotifications: async () => {
      let notificationsCount = await selectors.notification.count();
      while (notificationsCount > 0) {
        const topNotification = selectors.notification.first();
        console.warn(await selectors.notificationMessage(topNotification).textContent());

        if (await selectors.notificationDownloadButton(topNotification).isVisible()) {
          const [download] = await Promise.all([
            // Start waiting for the download
            page.waitForEvent('download'),
            // Perform the action that initiates download
            selectors.notificationDownloadButton(topNotification).click(),
          ]);
          await saveDownloadAsArtifact(download);
        }
        await selectors.notificationDismissButton(topNotification).click();
        await expect(selectors.notification).toHaveCount(notificationsCount - 1);
        notificationsCount = await selectors.notification.count();
      }
    },
  };
};
