#!/usr/bin/env node
// Step 1: show the Flex SSO connection (JQ...) of a helpline's Twilio account.
// No Okta credentials needed; uses the public Flex auth config endpoint.

import { parseArgs, requireArgs, normalizeEnvironment } from './lib/args.mjs';
import { resolveAccountSid } from './lib/helplineConfig.mjs';
import { getFlexSsoConnection, flexCallbackUrl, flexAudience } from './lib/flex.mjs';

const args = parseArgs();
requireArgs(args, ['hl', 'env'], `
Usage: node flexSsoConnection.mjs --hl <short code> --env <staging|production> [--account-sid AC...] [--accounts-file file.json]

Prints the Flex SSO connection id of the helpline's Twilio account and the URLs the Okta app must use.
The account SID comes from --account-sid, --accounts-file or AWS SSM (/terraform/twilio-iac/<env>/<hl>/secrets.json).
`);

const environment = normalizeEnvironment(args.env);
const accountSid = resolveAccountSid(args.hl, environment, args);
if (!accountSid) {
  console.error('❌ Could not resolve the account SID (pass --account-sid, --accounts-file, or run with AWS credentials)');
  process.exit(1);
}

const connection = await getFlexSsoConnection(accountSid);
if (!connection) {
  console.error(`❌ No Flex SSO connection for ${args.hl}/${environment}. Open Twilio Console > Flex > Users and access > Single sign-on (SSO) once.`);
  process.exit(1);
}

console.log(`Flex SSO connection for ${args.hl}/${environment}: ${connection.connectionSid} (${connection.active ? 'active' : 'INACTIVE'})`);
console.log(`  Okta "Single sign-on URL" / recipient / destination: ${flexCallbackUrl(connection.connectionSid)}`);
console.log(`  Okta "Audience URI (SP Entity ID)":                  ${flexAudience(connection.connectionSid)}`);
