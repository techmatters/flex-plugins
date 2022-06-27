import { test, expect } from '@playwright/test';
import { logPageTelemetry } from '../browser-logs';

test('Plugin loads', async ({ page }) => {
  logPageTelemetry(page);
  page.goto('/', { waitUntil: 'networkidle' });
  const callsWaitingLabel = page.locator(
    "div.Twilio-AgentDesktopView-default div[data-testid='Childline-voice']",
  );
  await callsWaitingLabel.waitFor();
  await expect(callsWaitingLabel).toContainText('Calls');
});
