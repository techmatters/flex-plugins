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
    waitingTaskCounterLabel: (queueName: string, channel: string) =>
      page.locator(
        `div.Twilio-AgentDesktopView-default div[data-testid='${queueName}-${channel}'] div[data-testid='channel-box-inner-value']`,
      ),
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

  const waitForTaskInQueue = async (
    queueName: string,
    channelType: string,
    timeoutInMs?: number,
  ): Promise<void> => {
    await expect(selectors.waitingTaskCounterLabel(queueName, channelType)).toContainText('1', {
      timeout: timeoutInMs,
    });
    console.debug(`Task of channel type ${channelType} seen in queue '${queueName}'`);
  };

  return {
    addOfflineContact,
    waitForTaskInQueue,
  };
};

export const clickThroughTwilioPasteModals = async (page: Page, initialTimeout: number = 5000) => {
  const MAX_ATTEMPTS = 100;
  let attempts = 0;
  console.debug(`[${new Date().toISOString()}] Starting dismissing Twilio Paste modals`);
  try {
    await page.waitForSelector('button[data-paste-element="MODAL_HEADER_CLOSE_BUTTON"]', {
      timeout: initialTimeout,
      state: 'visible',
    });
    console.debug(`[${new Date().toISOString()}] First Twilio Paste modal detected`);
    // noinspection InfiniteLoopJS
    for (; attempts < MAX_ATTEMPTS; attempts++) {
      await page
        .locator('button[data-paste-element="MODAL_HEADER_CLOSE_BUTTON"]')
        .click({ timeout: 2000, force: true });
      console.info(`[${new Date().toISOString()}] Twilio Paste modal detected and dismissed`);
    }
  } catch (err) {
    if (err instanceof TimeoutError) {
      console.debug(
        `[${new Date().toISOString()}] Dismissed ${attempts} Twilio Paste modals, no more detected. Continuing`,
      );
      return;
    } else {
      throw err;
    }
  }
  throw new Error(
    `[${new Date().toISOString()}] Still attempting dismiss modals after ${attempts} attempts. Giving up.`,
  );
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
