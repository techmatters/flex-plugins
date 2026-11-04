#!/usr/bin/env node
// Org-wide audit: every Flex SAML app in Okta checked against the standard and against the Flex SSO
// connection of its Twilio account. Read-only. Helplines with okta config in twilio-iac are checked
// against that config; the others against the standard (optional "labels" attributes tolerated).

import fs from 'fs';
import { parseArgs } from './lib/args.mjs';
import { oktaGet } from './lib/oktaClient.mjs';
import { getExpectedApp, parseAppLabel, resolveAccountSid, listHelplineCodes } from './lib/helplineConfig.mjs';
import { getFlexSsoConnection } from './lib/flex.mjs';
import { checkApp, standardAttributes } from './lib/standard.mjs';

const args = parseArgs();
if (args.help) {
  console.log(`
Usage: node auditSsoDrift.mjs [--accounts-file file.json] [--hl jm,mt] [--out report.md]

Checks every active Okta SAML app labelled "<name> (<CODE>)" / "STG_<name> (<CODE>)".
Account SIDs (for the Flex connection check) come from --accounts-file or AWS SSM; without them that check is skipped.
`);
  process.exit(0);
}

const only = args.hl ? String(args.hl).toLowerCase().split(',') : null;
const knownCodes = new Set(listHelplineCodes());
const apps = (await oktaGet('/api/v1/apps?limit=200')).filter((a) => a.status === 'ACTIVE' && a.signOnMode === 'SAML_2_0');

const rows = [];
for (const app of apps) {
  const parsed = parseAppLabel(app.label);
  const isFlexApp = /login\.flex\.\w+\.twilio\.com|iam\.twilio\.com/.test(app.settings?.signOn?.ssoAcsUrl || '');
  if (!parsed || !isFlexApp || (only && !only.includes(parsed.code))) continue;

  const { code, environment } = parsed;
  const configured = knownCodes.has(code) ? getExpectedApp(code, environment) : null;
  // Not in Terraform yet: accept whichever optional attributes the app already sends
  const sentNames = (app.settings.signOn.attributeStatements || []).map((a) => a.name.trim());
  const expected = configured ?? {
    attributeStatementsMode: 'legacy',
    optionalAttributeSets: standardAttributes.filter((s) => s.optional_set && sentNames.includes(s.name)).map((s) => s.optional_set),
    extraAttributeStatements: (app.settings.signOn.attributeStatements || [])
      .filter((a) => !standardAttributes.some((s) => s.name === a.name.trim()))
      .map((a) => ({ name: a.name, legacy: (a.values || []).join(','), namespace: a.namespace.split(':').pop() })),
  };

  const accountSid = knownCodes.has(code) ? resolveAccountSid(code, environment, args) : null;
  const flexConnection = accountSid ? await getFlexSsoConnection(accountSid).catch(() => null) : null;
  const federatedClaims = await oktaGet(`/api/v1/apps/${app.id}/federated-claims`).catch(() => []);

  let groupNames = null;
  if (configured) {
    const assignments = await oktaGet(`/api/v1/apps/${app.id}/groups?limit=200`);
    groupNames = await Promise.all(assignments.map(async (a) => (await oktaGet(`/api/v1/groups/${a.id}`)).profile.name));
  }

  const results = checkApp(app, expected, { flexConnectionSid: flexConnection?.connectionSid, assignedGroupNames: groupNames, federatedClaims });
  if (/iam\.twilio\.com/.test(app.settings.signOn.ssoAcsUrl)) {
    results.push({ check: 'Uses Enhanced (login.flex) SSO', ok: false, detail: 'legacy iam.twilio.com SSO', severity: 'warning' });
  }
  rows.push({ app, code, environment, configured: Boolean(configured), results });
  process.stdout.write('.');
}
console.log('\n');

// Report
const icon = (r) => ({ ok: '✅', warning: '⚠️', error: '❌' })[r.severity];
const lines = [
  `# Okta Flex SSO audit`,
  '',
  `Generated ${new Date().toISOString()} · ${rows.length} apps · ${rows.filter((r) => r.results.every((x) => x.severity !== 'error')).length} without errors`,
  '',
  '| Helpline | Env | Okta app | In Terraform config | Errors | Warnings |',
  '|---|---|---|---|---|---|',
];
const describe = (rs, severity) =>
  rs.filter((x) => x.severity === severity).map((x) => `${x.check}${x.detail ? `: ${x.detail}` : ''}`).join('<br>').replace(/\|/g, '\\|') || '—';

rows.sort((a, b) => a.code.localeCompare(b.code) || a.environment.localeCompare(b.environment));
for (const row of rows) {
  lines.push(`| ${row.code} | ${row.environment} | ${row.app.label} | ${row.configured ? 'yes' : 'no'} | ${describe(row.results, 'error')} | ${describe(row.results, 'warning')} |`);
}
const report = lines.join('\n') + '\n';

if (args.out) {
  fs.writeFileSync(args.out, report);
  console.log(`📄 ${args.out}`);
}
for (const row of rows) {
  const bad = row.results.filter((x) => x.severity !== 'ok');
  console.log(`${bad.some((x) => x.severity === 'error') ? '❌' : bad.length ? '⚠️ ' : '✅'} ${row.code}/${row.environment} ${row.app.label}`);
  for (const r of bad) console.log(`     ${icon(r)} ${r.check}${r.detail ? `: ${r.detail}` : ''}`);
}
