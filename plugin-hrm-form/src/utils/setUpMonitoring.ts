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

import * as Flex from '@twilio/flex-ui';
import Rollbar from 'rollbar';
import { datadogRum } from '@datadog/browser-rum';
import * as FullStory from '@fullstory/browser';
import { ServiceConfiguration } from '@twilio/flex-ui';
import type { Worker } from 'twilio-taskrouter';

import { rollbarAccessToken, datadogAccessToken, datadogApplicationID, fullStoryId } from '../private/secret';

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

function setUpRollbarLogger(plugin: { Rollbar?: Rollbar }, workerClient: Worker, monitoringEnv: string) {
  plugin.Rollbar = new Rollbar({
    reportLevel: 'error',
    accessToken: rollbarAccessToken,
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: monitoringEnv,
      person: {
        id: workerClient.sid,
        account: workerClient.accountSid,
        workspace: workerClient.workspaceSid,
        helpline: (workerClient.attributes as any).helpline,
      },
    },
    ignoredMessages: ['Warning: Failed prop type'],
    maxItems: 500,
    ignoreDuplicateErrors: true,
    scrubTelemetryInputs: true,
  });

  const myLogManager = new Flex.Log.LogManager({
    spies: [
      {
        type: Flex.Log.PredefinedSpies.ClassProxy,
        target: window.console,
        targetAlias: 'Proxied window.console',
        methods: ['error'],
        onStart: proxy => {
          window.console = proxy;
        },
      },
    ],
    storage: () => null,
    formatter: () => entries => entries[0],
    transport: () => ({
      flush: entry => {
        const collectedData = entry && entry.subject && entry.args;
        if (!collectedData) {
          return;
        }

        const args = entry.args.join();
        const isRollbarMethod = typeof plugin.Rollbar[entry.subject] === 'function';

        if (isRollbarMethod) {
          plugin.Rollbar[entry.subject](args);
        } else {
          plugin.Rollbar.log(args);
        }
      },
    }),
  });

  myLogManager.prepare().then(myLogManager.start);
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

export default function setUpMonitoring(
  plugin: { Rollbar?: Rollbar },
  workerClient: Worker,
  serviceConfiguration: ServiceConfiguration,
) {
  const monitoringEnv = serviceConfiguration.attributes.monitoringEnv || 'staging';

  if (process.env.ENABLE_MONITORING === 'true') {
    setUpDatadogRum(workerClient, monitoringEnv);
    setUpRollbarLogger(plugin, workerClient, monitoringEnv);
  }

  if (serviceConfiguration.attributes.feature_flags.enable_fullstory_monitoring) {
    setUpFullStory();
    helplineIdentifierFullStory(workerClient);
  }
}
