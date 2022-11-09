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
