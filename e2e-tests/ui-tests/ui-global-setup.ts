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
import { expect, Page } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/no-empty-function
async function globalSetup() {}

export default globalSetup;

export const navigateToAgentDesktop = async (page: Page) => {
  await page.goto('/agent-desktop', { waitUntil: 'domcontentloaded' });
  const callsWaitingLabel = page.locator(
    "div.Twilio-AgentDesktopView-default div[data-testid='Fake Queue-voice']",
  );
  await expect(callsWaitingLabel).toBeVisible({ timeout: 30000 });
};
