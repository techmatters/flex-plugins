import { getSSMParametersByPath } from '../helpers/ssm';
import { logDebug } from '../helpers/log';

export const enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  LOCAL = 'local',
}

export const enum Strategy {
  SEQUENTIAL = 'sequential',
  CONCURRENT = 'concurrent',
}

type AccountSID = `AC${string}`;

export const runAgainstAllAccountsForEnvironment = async (
  environment: Environment,
  action: (accountSid: AccountSID, authToken: string) => Promise<void>,
  strategy: Strategy = Strategy.SEQUENTIAL,
) => {
  const allTwilioTokenParameters = await getSSMParametersByPath(`/${environment}/twilio`);
  logDebug(
    'allTwilioTokenParameters found for:',
    `/${environment}/twilio`,
    allTwilioTokenParameters.length,
  );
  const allCreds = allTwilioTokenParameters
    .map((parameter) => {
      logDebug('Testing parameter:', parameter.Name);
      const match = parameter.Name!.match(/\/[a-z]+\/twilio\/(AC[0-9a-fA-F]+)\/auth_token/);
      if (match) {
        logDebug('found accountSid:', match[1]);
        return { accountSid: match[1], authToken: parameter.Value! };
      }
      return null;
    })
    .filter((p) => p) as { accountSid: AccountSID; authToken: string }[];
  logDebug('account cred sets found:', allCreds.length);
  if (strategy === Strategy.SEQUENTIAL) {
    // eslint-disable-next-line no-restricted-syntax
    for (const { accountSid, authToken } of allCreds) {
      // eslint-disable-next-line no-await-in-loop
      await action(accountSid, authToken);
    }
  } else {
    await Promise.all(allCreds.map(({ accountSid, authToken }) => action(accountSid, authToken)));
  }
};
