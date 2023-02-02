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
      await selectors.userActivityDropdownButton.click();
      console.log('Worker status dropdown should be open');
      const statusSelector = selectors.userActivityDropdownOption(status);
      await statusSelector.waitFor({ state: 'visible' });
      console.log('Worker status option spotted');
      await statusSelector.click();
      console.log('Worker status option clicked');
      await expect(selectors.userActivityDropdownButton).toContainText(status.toLocaleString());
      console.log('Status changed');
    },
  };
}
