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

import { ServiceConfiguration } from '@twilio/flex-ui';
import { datadogRum } from '@datadog/browser-rum';
import * as FullStory from '@fullstory/browser';
import type { Worker } from 'twilio-taskrouter';

import { datadogAccessToken, datadogApplicationID, fullStoryId } from '../private/secret';

function setUpDatadogRum(workerClient: Worker, monitoringEnv: string) {
  datadogRum.init({
    applicationId: datadogApplicationID,
    clientToken: datadogAccessToken,
    site: 'datadoghq.com',
    env: monitoringEnv,
    sampleRate: 100,
    trackInteractions: true,
    // service: 'my-web-application',
  });

  datadogRum.addRumGlobalContext('person', {
    id: workerClient.sid,
    account: workerClient.accountSid,
    workspace: workerClient.workspaceSid,
    helpline: (workerClient.attributes as any).helpline,
  });
}

function setUpFullStory() {
  FullStory.init({
    orgId: fullStoryId,
    devMode: process.env.ENABLE_MONITORING !== 'true',
  });
  console.log('Fullstory monitoring is enabled');
}

/**
 * Identifies helpline usage by Twilio Account ID (accountSid) in FullStory
 * @param workerClient
 */
function helplineIdentifierFullStory(workerClient) {
  const { accountSid } = workerClient;
  FullStory.setUserVars({ accountSid });
}

export default function setUpMonitoring(workerClient: Worker, serviceConfiguration: ServiceConfiguration) {
  const monitoringEnv = serviceConfiguration.attributes.monitoringEnv || 'staging';

  if (process.env.ENABLE_MONITORING === 'true') {
    setUpDatadogRum(workerClient, monitoringEnv);
  }

  if (process.env.ENABLE_MONITORING === 'true') {
    setUpFullStory();
    helplineIdentifierFullStory(workerClient);
  }
}
