#!/usr/bin/env node
// Steps 4-6: verify a helpline's Okta app against the standard and its configuration, check it points at
// the right Flex connection, and optionally capture the real SAML assertion for a test user.
// Read-only. Exit code 1 when any check fails.

import { parseArgs, requireArgs, normalizeEnvironment } from './lib/args.mjs';
import { loadAppContext, printResults } from './lib/appContext.mjs';
import { checkApp, expectedAttributes } from './lib/standard.mjs';
import { captureSamlAssertion } from './lib/samlLogin.mjs';

const args = parseArgs();
requireArgs(args, ['hl', 'env'], `
Usage: node verifySso.mjs --hl <short code> --env <staging|production> [options]

Options:
  --label "<label>"        Okta app label, for helplines without okta config in twilio-iac/helplines
  --optional-sets labels,team  Optional standard attributes, for helplines without okta config
  --account-sid AC...      Twilio account SID (otherwise --accounts-file or AWS SSM)
  --accounts-file <file>   Private JSON { "<code>": { "staging": "AC...", "production": "AC..." } }
  --login                  Also log in as OKTA_TEST_USERNAME / OKTA_TEST_PASSWORD (no MFA) and check the
                           attributes in the real SAML assertion. Does not complete the Flex login.
  --json                   Machine-readable output
`);

const environment = normalizeEnvironment(args.env);
const ctx = await loadAppContext(args.hl, environment, args);

let results;
if (!ctx.app) {
  results = [{ check: `Okta app "${ctx.expected.label}" exists and is active`, ok: false, detail: 'not found', severity: 'error' }];
} else {
  results = checkApp(ctx.app, ctx.expected, {
    flexConnectionSid: ctx.flexConnection?.connectionSid,
    assignedGroupNames: ctx.configured ? ctx.assignedGroupNames : null,
    federatedClaims: ctx.federatedClaims,
  });
  if (ctx.flexConnection && !ctx.flexConnection.active) {
    results.push({ check: 'Flex SSO connection is active', ok: false, detail: ctx.flexConnection.connectionSid, severity: 'error' });
  }
  if (!ctx.configured) {
    results.push({ check: 'Helpline has okta/okta_app config in twilio-iac', ok: false, detail: 'groups not checked', severity: 'warning' });
  }
}

let assertion = null;
if (args.login && ctx.app) {
  try {
    assertion = await captureSamlAssertion(ctx.accountSid);
    const wanted = expectedAttributes(ctx.expected).map((a) => a.name);
    const received = Object.keys(assertion.attributes);
    const missing = wanted.filter((n) => !received.includes(n));
    const extra = received.filter((n) => !wanted.includes(n));
    results.push({
      check: 'Real SAML assertion carries the expected attributes',
      ok: missing.length === 0 && extra.length === 0,
      detail: [missing.length && `missing (or empty for this user): ${missing.join(', ')}`, extra.length && `unexpected: ${extra.join(', ')}`].filter(Boolean).join('; '),
      severity: missing.length || extra.length ? 'error' : 'ok',
    });
  } catch (err) {
    results.push({ check: 'Real SAML assertion captured', ok: false, detail: err.message, severity: 'error' });
  }
}

if (args.json) {
  console.log(JSON.stringify({ helpline: args.hl, environment, label: ctx.expected.label, results, assertion }, null, 2));
} else {
  console.log(`Okta app ${ctx.expected.label} (${args.hl}/${environment})\n`);
  printResults(results);
  if (assertion) {
    console.log('\nSAML assertion attributes for the test user:');
    for (const [name, values] of Object.entries(assertion.attributes)) console.log(`  ${JSON.stringify(name)}: ${JSON.stringify(values)}`);
  }
}
process.exit(results.some((r) => r.severity === 'error') ? 1 : 0);
