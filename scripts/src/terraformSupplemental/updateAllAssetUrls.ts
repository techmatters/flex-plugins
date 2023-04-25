import {
  Environment,
  runAgainstAllAccountsForEnvironment,
} from './runAgainstAllAccountsForEnvironment';
import { patchFeatureFlags } from './updateFlexServiceConfiguration';
import { logDebug } from '../helpers/log';

async function main() {
  // eslint-disable-next-line no-restricted-syntax
  for (const environment of [
    // Environment.DEVELOPMENT,
    Environment.STAGING,
    // Environment.PRODUCTION,
  ]) {
    logDebug(`Updating asset urls for ${environment}`);
    // eslint-disable-next-line no-await-in-loop
    await runAgainstAllAccountsForEnvironment(environment, async (accountSid, authToken) => {
      process.env.TWILIO_ACCOUNT_SID = accountSid;
      process.env.TWILIO_AUTH_TOKEN = authToken;
      await patchFeatureFlags(
        {},
        { assets_bucket_url: `https://assets-${environment}.tl.techmatters.org` },
        true,
      );
    });
  }
}

main().catch((err) => {
  throw err;
});
