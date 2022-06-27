// your account sid
const accountSid = '__TWILIO_ACCOUNT_SID__';

/*
 * set to /plugins.json for local dev
 * set to /plugins.local.build.json for testing your build
 * set to "" for the default live plugin loader
 */
const pluginServiceUrl = '/plugins';

const appConfig = {
  pluginService: {
    enabled: true,
    url: pluginServiceUrl,
  },
  sso: {
    accountSid,
  },
  ytica: false,
  logLevel: 'debug',
  showSupervisorDesktopView: true,
};
