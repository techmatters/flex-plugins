import { test, expect } from '@playwright/test';
import { logPageErrors } from '../browser-logs';

test('Plugin loads', async ({ page }) => {
  logPageErrors(page, false);
  page.goto('/', { waitUntil: 'networkidle' });
  const callsWaitingLabel = page.locator(
    "div.Twilio-AgentDesktopView-default div[data-testid='Childline-voice']",
  );
  await callsWaitingLabel.waitFor();
  await expect(callsWaitingLabel).toContainText('Calls');
});
