/* eslint-disable import/no-unused-modules */
import * as Flex from '@twilio/flex-ui';
import Rollbar from 'rollbar';

import { rollbarAccessToken } from '../private/secret';

export function setUpRollbarLogger(plugin, workerClient) {
console.log('>>>>', workerClient)

  plugin.Rollbar = new Rollbar({
    reportLevel: 'warning',
    accessToken: rollbarAccessToken,
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: 'staging',
      person: {
        id: workerClient.sid,
        account: workerClient.accountSid,
        workspace: workerClient.workspaceSid,
        helpline: workerClient.attributes.helpline,
      },
    },
    ignoredMessages: ['Warning: Failed prop type'],
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
