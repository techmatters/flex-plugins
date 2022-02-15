import * as Flex from '@twilio/flex-ui';
import Rollbar from 'rollbar';
import { datadogRum } from '@datadog/browser-rum';
import * as FullStory from '@fullstory/browser';

import { rollbarAccessToken, datadogAccessToken, datadogApplicationID, fullStoryId } from '../private/secret';

function setUpDatadogRum(workerClient, monitoringEnv) {
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
    helpline: workerClient.attributes.helpline,
  });
}

function setUpRollbarLogger(plugin, workerClient, monitoringEnv) {
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
        helpline: workerClient.attributes.helpline,
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
        methods: ['log', 'debug', 'info', 'warn', 'error'],
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
    devMode: false,
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

export default function setUpMonitoring(plugin, workerClient, serviceConfiguration) {
  const monitoringEnv = serviceConfiguration.attributes.monitoringEnv || 'staging';

  if (process.env.NODE_ENV !== 'development'){
    setUpDatadogRum(workerClient, monitoringEnv);
    setUpRollbarLogger(plugin, workerClient, monitoringEnv);
  }

  if (serviceConfiguration.attributes.feature_flags.enable_fullstory_monitoring) {
    setUpFullStory();
    helplineIdentifierFullStory(workerClient);
  }
}
