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
import hrmContacts from './hrm/contacts';

/**
 * All the mocking required for a new Flex session with Aselo to successfully load
 * @param page
 */
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
  await hrmContacts().mockCaseEndpoints(page);
};
