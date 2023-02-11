import { fakeAuthenticatedBrowser } from '../flex-in-a-box/flex-auth';
import context from '../flex-in-a-box/global-context';
import { configurationServices } from '../flex-in-a-box/service-mocks/configuration';
import { serviceConfigurationAttributes } from './service-configuration';
import { authenticationServices } from '../flex-in-a-box/service-mocks/authentication';
import { channelService } from '../flex-in-a-box/service-mocks/channels';
import { setLoggedInWorkerLiveQuery } from '../flex-in-a-box/twilio-worker';
import { mockListWorkerQueues } from './serverless/listWorkerQueues';
import { mockPopulateCounselors } from './serverless/populateCounselors';
import { mockIssueSyncToken } from './serverless/issueSyncToken';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import { mockFormDefinitions } from './form-definitions';

export const mockStartup = async (page: Page) => {
  const configServices = configurationServices(page);
  const authServices = authenticationServices(page);
  const chnlServices = channelService(page);

  await Promise.all([
    fakeAuthenticatedBrowser(page, context.ACCOUNT_SID),
    configServices.mockFlexServiceConfigurationPublicEndpoint(context.ACCOUNT_SID),
    configServices.mockFlexServiceConfigurationEndpoint(context.ACCOUNT_SID, {
      attributes: serviceConfigurationAttributes(),
    }),
    mockFormDefinitions(page),
    configServices.mockSessionEndpoint(),
    authServices.mockTwilioIamRefresh(context.ACCOUNT_SID),
    authServices.mockTwilioIamValidate(context.ACCOUNT_SID),
    chnlServices.mockWsChannelsEndpoint(),
  ]);

  setLoggedInWorkerLiveQuery();
  await mockListWorkerQueues(page);
  await mockPopulateCounselors(page);
  await mockIssueSyncToken(page);
};
