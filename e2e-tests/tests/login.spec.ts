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

import { test } from '@playwright/test';
import { logPageTelemetry } from '../browser-logs';

test('Plugin loads', async ({ page }) => {
  logPageTelemetry(page);
  await page.goto('/agent-desktop', { waitUntil: 'networkidle' });
  const callsWaitingLabel = page.locator(
    "div.Twilio-AgentDesktopView-default div[data-testid='Childline-voice']",
  );
  await callsWaitingLabel.waitFor({ state: 'visible' });
});
