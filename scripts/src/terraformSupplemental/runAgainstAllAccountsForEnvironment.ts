import { getSSMParameter, getSSMParametersByPath } from '../helpers/ssm';
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

export const forShortCodes = (helplineCodes: string[] | string) => (shortCode: string) =>
  (Array.isArray(helplineCodes) ? helplineCodes : [helplineCodes]).includes(shortCode);

export const runAgainstAllAccountsForEnvironment = async (
  environment: Environment,
  action: (accountSid: AccountSID, authToken: string) => Promise<void>,
  strategy: Strategy = Strategy.SEQUENTIAL,
  filter: (shortCode: string, accountSid: AccountSID) => boolean = () => true,
) => {
  const allTwilioTokenParameters = await getSSMParametersByPath(`/${environment}/twilio`);
  logDebug(
    'allTwilioTokenParameters found for:',
    `/${environment}/twilio`,
    allTwilioTokenParameters.length,
  );
  const allAccounts = allTwilioTokenParameters
    .map((parameter) => {
      const match = parameter.Name!.match(/\/[a-z]+\/twilio\/([0-9a-zA-Z]+)\/account_sid/);
      if (match) {
        logDebug('found accountSid:', match[1], parameter.Value);
        return { shortCode: match[1], accountSid: parameter.Value! as AccountSID };
      }
      logDebug('Miss:', parameter.Name);

      return null;
    })
    .filter(
      (p: { shortCode: string; accountSid: AccountSID } | null) =>
        p && filter(p.shortCode, p.accountSid),
    );
  const allCreds = await Promise.all(
    allAccounts.map(async (p) => {
      const { accountSid } = p!;
      return {
        accountSid,
        authToken: (await getSSMParameter(`/${environment}/twilio/${accountSid}/auth_token`, true))!
          .Parameter!.Value!,
      };
    }),
  );
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
