import { test } from '@playwright/test';
import { logPageTelemetry } from '../browser-logs';
import { fakeAuthenticatedBrowser } from '../flex-in-a-box/flex-auth';
import { configurationServices } from '../flex-in-a-box/service-mocks/configuration';
import { authenticationServices } from '../flex-in-a-box/service-mocks/authentication';
import * as mockServer from '../flex-in-a-box/proxied-endpoints';
import context from '../flex-in-a-box/global-context';
import { channelService } from '../flex-in-a-box/service-mocks/channels';
import { serviceConfigurationAttributes } from '../aselo-service-mocks/service-configuration';
import { mockListWorkerQueues } from '../aselo-service-mocks/serverless/listWorkerQueues';
import { mockPopulateCounselors } from '../aselo-service-mocks/serverless/populateCounselors';
import { mockIssueSyncToken } from '../aselo-service-mocks/serverless/issueSyncToken';
import { setLoggedInWorkerLiveQuery } from '../flex-in-a-box/twilio-worker';

test.beforeAll(async () => {
  await mockServer.start();
});

test.afterAll(async () => {
  await mockServer.stop();
});

test('Plugin loads', async ({ page }) => {
  logPageTelemetry(page);
  await fakeAuthenticatedBrowser(page, context.ACCOUNT_SID);
  const configServices = configurationServices(page);
  await configServices.mockFlexServiceConfigurationPublicEndpoint(context.ACCOUNT_SID);
  await configServices.mockFlexServiceConfigurationEndpoint(context.ACCOUNT_SID, {
    attributes: serviceConfigurationAttributes(),
  });
  await configServices.mockSessionEndpoint();
  const authServices = authenticationServices(page);
  await authServices.mockTwilioIamRefresh(context.ACCOUNT_SID);
  await authServices.mockTwilioIamValidate(context.ACCOUNT_SID);
  const chnlServices = channelService(page);
  await chnlServices.mockWsChannelsEndpoint();
  setLoggedInWorkerLiveQuery();
  await mockListWorkerQueues(page);
  await mockPopulateCounselors(page);
  await mockIssueSyncToken(page);
  await page.goto('/agent-desktop', { waitUntil: 'networkidle' });
  const callsWaitingLabel = page.locator(
    "div.Twilio-AgentDesktopView-default div[data-testid='Fake Queue-voice']",
  );
  await callsWaitingLabel.waitFor({ timeout: 60 * 60000, state: 'visible' });
});
