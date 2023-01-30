// your account sid
const accountSid = '__TWILIO_ACCOUNT_SID__';

/*
 * set to /plugins.json for local dev
 * set to /plugins.local.build.json for testing your build
 * set to "" for the default live plugin loader
 */
const pluginServiceUrl = '/plugins.json';

const appConfig = {
  pluginService: {
    enabled: true,
    url: pluginServiceUrl,
    // If this is not set flex waits for 10 seconds between running plugin init() and rendering components :-/
    initializationTimeout: 1,
  },
  sso: {
    accountSid,
  },
  ytica: false,
  logLevel: 'debug',
  showSupervisorDesktopView: true,
};
