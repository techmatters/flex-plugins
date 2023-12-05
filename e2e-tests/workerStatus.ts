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
import { Locator, Page } from '@playwright/test';

export const WORKER_STATUS = {
  AVAILABLE: ['Available', 'Ready'],
  OFFLINE: ['Offline'],
};

export type WorkerStatus = keyof typeof WORKER_STATUS;

async function getFirstMatchingStatus(page: Page, statusOptions: string[]): Promise<Locator> {
  for (let status of statusOptions) {
    let locator = page.locator(
      `//div[@aria-label='Activity selection']//button[@data-paste-element='MENU_ITEM']//span[text()='${status}']`,
    );
    if (await locator.isVisible()) {
      return locator;
    }
  }
  throw new Error('No matching status found');
}

export function statusIndicator(page: Page) {
  const selectors = {
    userActivityDropdownButton: page.locator("//button[@data-testid='activity-dropdown-button']"),
    activityMenu: page.locator("//div[@data-testid='activity-menu']"),
  };

  return {
    setStatus: async function (status: WorkerStatus) {
      await selectors.userActivityDropdownButton.click();
      console.log('Worker status dropdown should be open');
      await selectors.activityMenu.waitFor({ state: 'visible' });
      const statusSelector = await getFirstMatchingStatus(page, WORKER_STATUS[status]);
      console.log('Worker status option spotted');
      await statusSelector.click();
      console.log('Worker status option clicked');
    },
  };
}
