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

export const agentDesktop = (page: Page) => {
  const selectors = {
    addOfflineContactButton: () =>
      page.locator(`//button[@data-fs-id='Task-AddOfflineContact-Button']`),
  };

  const addOfflineContact = async () => {
    const addOfflineContactButton = selectors.addOfflineContactButton();
    await expect(addOfflineContactButton).toBeVisible();
    for (let i = 0; i < 3; i++) {
      try {
        await addOfflineContactButton.click();
        await expect(addOfflineContactButton).not.toBeEnabled({ timeout: 5000 });
        const dataCallTypeButton = page.locator(
          `//button[@data-testid='DataCallTypeButton-child']`,
        );
        await expect(dataCallTypeButton).toBeVisible({ timeout: 5000 });
        break;
      } catch (e) {
        if (i === 2) {
          throw e;
        }
      }
    }
  };

  return {
    addOfflineContact,
  };
};

export const navigateToAgentDesktop = async (page: Page) => {
  await page.goto('/agent-desktop', { waitUntil: 'networkidle' });

  // There are multiple elements so we need to use waitForSelector instead of a locator/waitFor
  await page.waitForSelector('button[data-testid="AddTaskButton"]');
};
