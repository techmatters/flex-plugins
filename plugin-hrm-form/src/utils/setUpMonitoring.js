import * as Flex from '@twilio/flex-ui';
import Rollbar from 'rollbar';
import { datadogRum } from '@datadog/browser-rum';

import { PLUGIN_VERSION } from '../HrmFormPlugin';
import { rollbarAccessToken, datadogAccessToken, datadogApplicationID } from '../private/secret';

function setUpDatadogRum(workerClient, monitoringEnv) {
  datadogRum.init({
    applicationId: datadogApplicationID,
    clientToken: datadogAccessToken,
    site: 'datadoghq.com',
    env: monitoringEnv,
    version: PLUGIN_VERSION,
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

export default function setUpMonitoring(plugin, workerClient, monitoringEnv) {
  setUpDatadogRum(workerClient, monitoringEnv);
  setUpRollbarLogger(plugin, workerClient, monitoringEnv);
}
