import { test } from '@playwright/test';
import { logPageTelemetry } from '../browser-logs';
import { fakeAuthenticatedBrowser } from '../flex-in-a-box/flex-auth';
import { configurationServices } from '../flex-in-a-box/service-mocks/configuration';
import { authenticationServices } from '../flex-in-a-box/service-mocks/authentication';
import * as mockServer from '../flex-in-a-box/proxied-endpoints';

const accountSid = 'FAKE_UI_TEST_ACCOUNT';

test.beforeAll(async () => {
  await mockServer.start();
});

test.afterAll(async () => {
  await mockServer.stop();
});

test('Plugin loads', async ({ page }) => {
  logPageTelemetry(page);
  await fakeAuthenticatedBrowser(page, accountSid);
  const configServices = configurationServices(page);
  await configServices.mockFlexServiceConfigurationPublicEndpoint(accountSid);
  await configServices.mockFlexServiceConfigurationEndpoint(accountSid);
  await configServices.mockSessionEndpoint();
  const authServices = authenticationServices(page);
  await authServices.mockTwilioIamRefresh(accountSid);
  await authServices.mockTwilioIamValidate(accountSid);
  await page.goto('/agent-desktop', { waitUntil: 'networkidle' });
  const callsWaitingLabel = page.locator(
    "div.Twilio-AgentDesktopView-default div[data-testid='Childline-voice']",
  );
  await callsWaitingLabel.waitFor({ state: 'visible' });
});
