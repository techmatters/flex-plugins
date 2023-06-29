import {
  Environment,
  runAgainstAllAccountsForEnvironment,
} from './runAgainstAllAccountsForEnvironment';
import { patchFeatureFlags } from './updateFlexServiceConfiguration';
import { logDebug } from '../helpers/log';

/**
 * This script was used to update the asset urls for all environments in a one off operation.
 * It is left here as an example of how to combine the runAgainstAllAccountsForEnvironment and patchFeatureFlags
 * scripts to update the configurations for all accounts in an environment.
 */
async function main() {
  // eslint-disable-next-line no-restricted-syntax
  for (const environment of [
    Environment.DEVELOPMENT,
    Environment.STAGING,
    Environment.PRODUCTION,
  ]) {
    logDebug(`Updating asset urls for ${environment}`);
    // eslint-disable-next-line no-await-in-loop
    await runAgainstAllAccountsForEnvironment(environment, async (accountSid, authToken) => {
      await patchFeatureFlags(
        accountSid,
        authToken,
        {},
        { assets_bucket_url: `https://assets-${environment}.tl.techmatters.org` },
        false,
      );
    });
  }
}

main().catch((err) => {
  throw err;
});
