import { config } from 'dotenv';
import yargs from 'yargs';
import fetch from 'node-fetch';
import * as fs from 'node:fs/promises';
import { getSSMParameter, setRoleToAssume } from './helpers/ssm';

config();

type Args = { [x in 'a' | 'h' | 'e' | 'ssmRole']: string | null } & { l: boolean };

async function main() {
  const args: Args = yargs(process.argv.slice(2))
    .command(
      '$0',
      'Generate a default set of json form definitions for an Aselo helpline.',
      (argv) => {
        argv.positional('definitionVersion', {
          describe:
            "The definition code for this set of forms (e.g. 'v1', 'br-v1'). The json definitions will be generated under a directory with this as it's name",
          type: 'string',
        });
      },
    )
    .option('a', {
      alias: 'accountSid',
      type: 'string',
      default: null,
      describe:
        'Helpline account sid - use instead of shortcode / environment if you want to avoid needing AWS access',
    })
    .option('h', {
      alias: 'helpline',
      type: 'string',
      default: null,
      describe: 'Helpline shortcode',
    })
    .option('e', {
      alias: 'helplineEnvironment',
      type: 'string',
      default: null,
      describe: 'Helpline environment',
    })
    .option('l', {
      alias: 'legacyAuth',
      type: 'boolean',
      default: false,
      describe: 'Legacy Auth Mode',
    })
    .option('ssmRole', {
      type: 'string',
      default: null,
      describe: 'Helpline environment',
    })
    .parseSync();
  console.debug('parsed args:', args);
  let { a: accountSid } = args;
  const { h: helplineShortCode, e: helplineEnvironment, ssmRole, l: legacyAuthMode } = args;
  if (!accountSid) {
    if (!helplineShortCode || !helplineEnvironment) {
      throw new Error('accountSid or helpline/helpline environment required');
    }
    if (ssmRole) {
      setRoleToAssume(ssmRole);
    }
    accountSid =
      (
        await getSSMParameter(
          `/${helplineEnvironment}/twilio/${helplineShortCode?.toUpperCase()}/account_sid`,
          !ssmRole,
        )
      )?.Parameter?.Value ?? null;

    if (!accountSid) {
      throw new Error(
        `Failed to find acccount SID for ${helplineEnvironment}/${helplineShortCode}`,
      );
    }
  }
  const templateText = await fs.readFile(
    legacyAuthMode
      ? '../plugin-hrm-form/public/appConfig.template.legacy-e2e.js'
      : '../plugin-hrm-form/public/appConfig.template.e2e.js',
    'utf8',
  );
  if (accountSid === 'AC_FAKE_UI_TEST_ACCOUNT') {
    await fs.writeFile(
      '../plugin-hrm-form/public/appConfig.js',
      templateText.replace('__TWILIO_ACCOUNT_SID__', accountSid),
    );
  } else {
    const resp = await fetch(
      `https://services.twilio.com/v1/Flex/Authentication/Config?AccountSid=${accountSid}`,
    );
    if (!resp.ok) {
      throw new Error(
        `Failed to fetch auth config for ${accountSid}: [${resp.status}]: ${await resp.text()}`,
      );
    }
    const {
      config_list: [{ connection_name: connectionName, client_id: clientId }],
    } = await resp.json();

    console.debug('Setting account SID to:', accountSid);
    console.debug('Setting connection to:', connectionName);
    console.debug('Setting client ID to:', clientId);

    await fs.writeFile(
      '../plugin-hrm-form/public/appConfig.js',
      templateText
        .replace('__TWILIO_ACCOUNT_SID__', accountSid)
        .replace('__TWILIO_CLIENT_ID__', clientId)
        .replace('__TWILIO_CONNECTION__', connectionName),
    );
  }
}

main().catch((err) => {
  throw err;
});
