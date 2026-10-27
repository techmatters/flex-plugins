#!/usr/bin/env node
// Onboarding status for a helpline + environment: checks the real systems (repo, AWS SSM, Twilio,
// Okta) and reports each step of twilio-iac/docs/new-account-provisioning.md as done, missing, or
// to be confirmed by a person. Read-only.
//
// Usage: node onboardingStatus.mjs --hl <code> --env <staging|production> [--account-sid AC...]
//          [--accounts-file file.json] [--hrm-repo ../hrm] [--json]
// Okta checks need the OKTA_* variables (see ../okta/README.md); without them they are skipped.

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { parseArgs, requireArgs, normalizeEnvironment } from '../okta/lib/args.mjs';
import { getExpectedApp, getHelplineOkta, resolveAccountSid, helplinesDir } from '../okta/lib/helplineConfig.mjs';
import { getFlexSsoConnection } from '../okta/lib/flex.mjs';
import { loadAppContext } from '../okta/lib/appContext.mjs';
import { checkApp } from '../okta/lib/standard.mjs';
import { getExpectedGroupRule, fetchGroupRules, checkGroupRule } from '../okta/lib/groupRules.mjs';
import { oktaGet } from '../okta/lib/oktaClient.mjs';

const args = parseArgs();
requireArgs(args, ['hl', 'env'], `
Usage: node onboardingStatus.mjs --hl <code> --env <staging|production> [options]

Options:
  --account-sid AC...     Twilio account SID (otherwise --accounts-file or AWS SSM)
  --accounts-file <file>  Private JSON { "<code>": { "staging": "AC...", "production": "AC..." } }
  --hrm-repo <path>       Local checkout of techmatters/hrm, to check the permissions file
  --json                  Machine-readable output
`);

const code = String(args.hl).toLowerCase();
const environment = normalizeEnvironment(args.env);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const steps = [];

// status: done | missing | manual (a person must confirm) | unknown (could not check here)
const add = (step, title, status, detail = '') => steps.push({ step, title, status, detail });
const exists = (p) => fs.existsSync(path.join(repoRoot, p));

// 1.1 Helpline configuration
const helplineDir = path.join(helplinesDir, code);
const configFiles = ['common.hcl', `${environment}.hcl`].filter((f) => fs.existsSync(path.join(helplineDir, f)));
add('1.1', 'Helpline config (common + environment file)', configFiles.length === 2 ? 'done' : 'missing', configFiles.length === 2 ? '' : `missing in helplines/${code}/`);
const okta = configFiles.length ? getHelplineOkta(code) : null;
const expectedApp = configFiles.length === 2 ? getExpectedApp(code, environment) : null;
add('1.1', 'Okta config (okta in common.hcl, okta_app in environment file)', okta && expectedApp ? 'done' : 'missing');

// 1.2 Secrets in SSM (existence only; the value is never read here)
let ssmStatus = 'unknown';
try {
  execFileSync('aws', ['ssm', 'describe-parameters', '--parameter-filters', `Key=Name,Values=/terraform/twilio-iac/${environment}/${code}/secrets.json`, '--query', 'Parameters[0].Name', '--output', 'text'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    .trim() === 'None' ? (ssmStatus = 'missing') : (ssmStatus = 'done');
} catch {
  ssmStatus = 'unknown';
}
add('1.2', `SSM secret /terraform/twilio-iac/${environment}/${code}/secrets.json`, ssmStatus, ssmStatus === 'unknown' ? 'no AWS credentials here' : '');

// Account SID (needed by the Twilio checks)
const accountSid = resolveAccountSid(code, environment, args);

// 1.3 Terraform stages: plans can only be confirmed on the devops node
add('1.3', 'provision / lex / system-down / configure applied (re-plan shows No changes)', 'manual', `make plan HL=${code} HL_ENV=${environment} in each stage`);
add('1.3', 'Phone number points at the voice Studio flow', 'manual', 'Twilio Console › Phone Numbers');

// 1.4 Error reporting
const reporter = fs.readFileSync(path.join(repoRoot, 'lambdas/TwilioErrorReporter/index.ts'), 'utf8');
add('1.4', 'Account in TwilioErrorReporter', accountSid ? (reporter.includes(accountSid) ? 'done' : 'missing') : 'unknown', accountSid ? '' : 'account SID unknown');
add('1.4', 'Errors webhook set in the Twilio console', 'manual');

// 1.5 Okta SSO
const flexConnection = accountSid ? await getFlexSsoConnection(accountSid).catch(() => null) : null;
add('1.5', 'Flex SSO connection exists (SSO page opened)', !accountSid ? 'unknown' : flexConnection ? 'done' : 'missing', flexConnection ? flexConnection.connectionSid : '');

const oktaAvailable = Boolean(process.env.OKTA_CLIENT_ID && process.env.OKTA_PRIVATE_KEY_PATH);
if (!oktaAvailable) {
  add('1.5', 'Okta checks', 'unknown', 'OKTA_* variables not set');
} else if (okta) {
  const groups = await oktaGet(`/api/v1/groups?q=${encodeURIComponent(okta.group_name)}&limit=50`);
  add('1.5', `Okta group "${okta.group_name}" (okta-org)`, groups.some((g) => g.profile.name === okta.group_name) ? 'done' : 'missing');

  const expectedRule = getExpectedGroupRule(code);
  if (expectedRule) {
    const ruleResults = checkGroupRule(expectedRule, await fetchGroupRules());
    const bad = ruleResults.filter((r) => r.severity === 'error');
    add('1.5', 'Group rule created and active (manual, Super/Org Admin)', bad.length ? 'missing' : 'done', bad.map((r) => r.detail).join('; '));
  }

  if (expectedApp) {
    const ctx = await loadAppContext(code, environment, args);
    if (!ctx.app) {
      add('1.5', `Okta app "${expectedApp.label}" (okta-app)`, 'missing');
    } else {
      add('1.5', `Okta app "${expectedApp.label}" (okta-app)`, 'done');
      const results = checkApp(ctx.app, ctx.expected, { flexConnectionSid: flexConnection?.connectionSid, assignedGroupNames: ctx.assignedGroupNames, federatedClaims: ctx.federatedClaims });
      const errors = results.filter((r) => r.severity === 'error');
      add('1.5', 'Okta app matches the standard (verifySso)', errors.length ? 'missing' : 'done', errors.map((r) => `${r.check}: ${r.detail}`).join('; '));
    }
  }
}
add('1.5', 'Okta values entered on the Flex SSO page + SSO login tested', 'manual');
add('1.6', 'Engineers invited to the Twilio console', 'manual');

// Phase 2
const formsDir = `lambdas/packages/hrm-form-definitions/form-definitions/${code}/v1`;
add('2.1', 'Form definitions', exists(formsDir) ? 'done' : 'missing', exists(formsDir) ? '' : formsDir);
const serviceConfigFile = path.join(helplineDir, 'configs/service-configuration/common.json');
const definitionVersion = fs.existsSync(serviceConfigFile) ? JSON.parse(fs.readFileSync(serviceConfigFile, 'utf8')).attributes?.definitionVersion : undefined;
add('2.1', `definitionVersion is ${code}-v1 in service-configuration/common.json`, definitionVersion === `${code}-v1` ? 'done' : 'missing', definitionVersion && definitionVersion !== `${code}-v1` ? `currently "${definitionVersion}"` : '');
add('2.1', 'Form definitions deployed to S3', 'manual', 'GitHub Actions › Deploy form-definitions to S3');
add('2.2', 'Twilio lambdas deployed', 'manual', 'GitHub Actions › Deploy All Twilio Lambdas (environment)');
add('2.3', 'Flex plugin deployed', 'manual', 'Flex Deploy workflow');
const webchatConfig = `aselo-webchat-react-app/configSrc/${code}`;
add('2.4', 'Webchat config (if the helpline uses webchat)', exists(webchatConfig) ? 'done' : 'missing', exists(webchatConfig) ? '' : webchatConfig);
add('2.4', 'Webchat config + app deployed (if the helpline uses webchat)', 'manual', 'Deploy Aselo Webchat React App - single helpline (also deploys the forms)');
if (args.hrmRepo) {
  const rules = path.join(path.resolve(String(args.hrmRepo)), 'hrm-domain/hrm-core/permission-rules', `${code}.json`);
  add('2.5', 'HRM permissions file', fs.existsSync(rules) ? 'done' : 'missing', fs.existsSync(rules) ? '' : rules);
} else {
  add('2.5', 'HRM permissions file', 'unknown', 'pass --hrm-repo <path to hrm checkout>');
}
add('2.6', 'FullStory segment', 'manual');
if (environment === 'production') add('2.7', 'docs bucket in CloudTrail access logging', 'manual');

// Output
if (args.json) {
  console.log(JSON.stringify({ helpline: code, environment, steps }, null, 2));
} else {
  const icon = { done: '✅', missing: '❌', manual: '🧑', unknown: '❔' };
  console.log(`Onboarding status: ${code}/${environment}  (✅ done · ❌ missing · 🧑 confirm by hand · ❔ not checked here)\n`);
  for (const s of steps) console.log(`${icon[s.status]} ${s.step.padEnd(4)} ${s.title}${s.detail ? `\n          ${s.detail}` : ''}`);
  const counts = Object.fromEntries(['done', 'missing', 'manual', 'unknown'].map((k) => [k, steps.filter((s) => s.status === k).length]));
  console.log(`\n${counts.done} done · ${counts.missing} missing · ${counts.manual} to confirm by hand · ${counts.unknown} not checked`);
}
