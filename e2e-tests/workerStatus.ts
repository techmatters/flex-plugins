// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, Page } from '@playwright/test';

export enum WorkerStatus {
  UNKNOWN,
  AVAILABLE = 'Available',
  OFFLINE = 'Offline',
}

export function statusIndicator(page: Page) {
  const selectors = {
    userActivityDropdownButton: page.locator("//button[@data-test='activity-dropdown-button']"),
    userActivityDropdownOption: (status: WorkerStatus) =>
      page.locator(
        `//div[@aria-label='Activity selection']//button[@data-paste-element='MENU_ITEM']//span[text()='${status}']`,
      ),
  };

  return {
    setStatus: async function (status: WorkerStatus) {
      const statusSelector = selectors.userActivityDropdownOption(status);
      await selectors.userActivityDropdownButton.click();
      console.log('Worker status dropdown should be open');
      await statusSelector.waitFor({ state: 'visible', timeout: 3000 });
      console.log('Worker status option spotted');
      await statusSelector.click();
      console.log('Worker status option clicked');
      await expect(selectors.userActivityDropdownButton).toContainText(status.toLocaleString());
      console.log('Status changed');
    },
  };
}
