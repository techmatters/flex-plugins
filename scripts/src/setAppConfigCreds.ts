import { config } from 'dotenv';
import yargs from 'yargs';
import fetch from 'node-fetch';
import * as fs from 'node:fs/promises';

config();

async function main() {
  const args = yargs(process.argv.slice(2))
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
    .option('accountSid', {
      type: 'string',
      default: null,
      global: true,
      describe:
        'Helpline account sid - use instead of shortcode / environment if you want to avoid needing AWS access',
    })
    .parseSync();
  const { accountSid } = args;
  if (!accountSid) {
    throw new Error('accountSid or helpline / helplineEnvironment parameters required');
  }
  const resp = await fetch(
    `https://services.twilio.com/v1/Flex/Authentication/Config?AccountSid=${accountSid}`,
  );
  if (!resp.ok) {
    throw new Error(
      `Failed to fetch auth config for ${accountSid}: [${resp.status}]: ${await resp.text()}`,
    );
  }
  const {
    config_list: { connection_name: connectionName, client_id: clientId },
  } = await resp.json();
  const templateText = await fs.readFile(
    '../plugin-hrm-form/public/appConfig.template.e2e.js',
    'utf8',
  );
  await fs.writeFile(
    '../plugin-hrm-form/public/appConfig.js',
    templateText
      .replace('__TWILIO_ACCOUNT_SID__', accountSid)
      .replace('__TWILIO_CLIENT_ID__', clientId)
      .replace('__TWILIO_CONNECTION__', connectionName),
  );
}

main().catch((err) => {
  throw err;
});
