import { test, expect } from '@playwright/test';

test('Plugin loads', async ({ page }) => {
  page.goto('/', { waitUntil: 'networkidle' });
  const callsWaitingLabel = page.locator(
    "div.Twilio-AgentDesktopView-default div[data-testid='Childline-voice']",
  );
  await callsWaitingLabel.waitFor();
  await expect(callsWaitingLabel).toContainText('Calls');
});
