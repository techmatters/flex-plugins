import * as Flex from '@twilio/flex-ui';
import Rollbar from 'rollbar';
import { datadogRum } from '@datadog/browser-rum';

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
  console.log('Fullstory monitoring is enabled');
  const fullStoryScript = document.createElement('script');
  fullStoryScript.setAttribute('type', 'text/javascript');
  // This could be done from an external source with loadJS (flex plugins), but fullStoryId might be exposed
  fullStoryScript.innerText = `window['_fs_debug'] = false; window['_fs_host'] = 'fullstory.com'; window['_fs_script'] = 'edge.fullstory.com/s/fs.js'; window['_fs_org'] = '${fullStoryId}'; window['_fs_namespace'] = 'FS'; (function(m,n,e,t,l,o,g,y){ if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;} g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[]; o=n.createElement(t);o.async=1;o.crossOrigin='anonymous';o.src='https://'+_fs_script; y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y); g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g('event',{n:i,p:v},s)}; g.anonymize=function(){g.identify(!!0)}; g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)}; g.log = function(a,b){g("log",[a,b])}; g.consent=function(a){g("consent",!arguments.length||a)}; g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)}; g.clearUserCookie=function(){}; g.setVars=function(n, p){g('setVars',[n,p]);}; g._w={};y='XMLHttpRequest';g._w[y]=m[y];y='fetch';g._w[y]=m[y]; if(m[y])m[y]=function(){return g._w[y].apply(this,arguments)}; g._v="1.3.0"; })(window,document,window['_fs_namespace'],'script','user');`;
  document.head.appendChild(fullStoryScript);
}

export default function setUpMonitoring(plugin, workerClient, serviceConfiguration) {
  const monitoringEnv = serviceConfiguration.attributes.monitoringEnv || 'staging';

  setUpDatadogRum(workerClient, monitoringEnv);
  setUpRollbarLogger(plugin, workerClient, monitoringEnv);
  if (serviceConfiguration.attributes.feature_flags.enable_fullstory_monitoring) setUpFullStory();
}
