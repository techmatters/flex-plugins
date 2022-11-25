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
