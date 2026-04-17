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
import { errors, expect, Page } from '@playwright/test';
import TimeoutError = errors.TimeoutError;

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

const clickThroughTwilioPasteModals = async (page: Page) => {
  const MAX_ATTEMPTS = 100;
  let attempts = 0;
  try {
    // noinspection InfiniteLoopJS
    for (; attempts < MAX_ATTEMPTS; attempts++) {
      await page
        .locator('div[data-paste-element="MODAL_HEADER_CLOSE_BUTTON"]')
        .click({ timeout: 250 });
      console.info('Twilio Paste modal detected and dismissed');
    }
  } catch (err) {
    if (err instanceof TimeoutError) {
      console.debug(`Dismissed ${attempts} Twilio modals, no more detected. Continuing`);
      return;
    } else {
      throw err;
    }
  }
  throw new Error(`Still attempting dismiss modals after ${attempts} attempts. Giving up.`);
};

export const navigateToAgentDesktop = async (page: Page) => {
  await page.goto('/agent-desktop', { waitUntil: 'domcontentloaded' });
  // There are multiple elements so we need to use waitForSelector instead of a locator/waitFor
  await page.waitForSelector('button[data-testid="AddTaskButton"]', {
    timeout: 45000,
    state: 'visible',
  });
  await expect(page.locator('button[data-testid="AddTaskButton"]').nth(0)).toBeVisible();
  await clickThroughTwilioPasteModals(page);
};
