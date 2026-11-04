#!/usr/bin/env node
// Audit Okta group rules against the helpline configuration. Read-only.
//
// Group rules are configured in helplines/<code>/common.hcl (okta.group_rule) but created by a person
// in Okta (only Super Admins / Org Admins can edit rules). This finds rules that are missing, different
// or inactive, and rules in Okta that target a helpline group but are not in the configuration.
// Exit code 1 when a configured rule is missing, different or inactive.

import fs from 'fs';
import { parseArgs } from './lib/args.mjs';
import { listHelplineCodes, getHelplineOkta } from './lib/helplineConfig.mjs';
import { getExpectedGroupRule, fetchGroupRules, checkGroupRule } from './lib/groupRules.mjs';

const args = parseArgs();
if (args.help) {
  console.log(`
Usage: node auditGroupRules.mjs [--hl jm,asop] [--out report.md]

Checks every helpline with okta.group_rule in twilio-iac/helplines/<code>/common.hcl against Okta, and
lists rules in Okta that assign to a helpline group but are not in the configuration.
`);
  process.exit(0);
}

const only = args.hl ? String(args.hl).toLowerCase().split(',') : null;
const codes = listHelplineCodes().filter((c) => c !== 'baseline' && (!only || only.includes(c)));
const rules = await fetchGroupRules();

const rows = [];
const configuredGroups = new Set();
for (const code of codes) {
  const okta = getHelplineOkta(code);
  if (!okta) continue;
  configuredGroups.add(okta.group_name);
  const expected = getExpectedGroupRule(code);

  if (expected) {
    rows.push({ code, group: okta.group_name, results: checkGroupRule(expected, rules) });
  } else {
    // No rule configured: warn if Okta has one for this group anyway (it would be invisible in config)
    const extra = rules.filter((r) => r.groupNames.includes(okta.group_name));
    rows.push({
      code,
      group: okta.group_name,
      results: extra.length
        ? [{ check: 'No group rule configured', ok: false, severity: 'warning', detail: `but Okta has ${extra.map((r) => `"${r.name}" (${r.status}): ${r.expression}`).join('; ')}. Add it to okta.group_rule` }]
        : [{ check: 'No group rule configured or in Okta (members added by hand)', ok: true, severity: 'ok', detail: '' }],
    });
  }
}

// Rules in Okta that target helpline groups not (yet) configured in twilio-iac
const unconfigured = only
  ? []
  : rules.filter((r) => r.groupNames.some((g) => /\([A-Z]+\)\s*$/.test(g) && !configuredGroups.has(g)));

// Output
const icon = { ok: '✅', warning: '⚠️ ', error: '❌' };
for (const row of rows) {
  const worst = row.results.some((r) => r.severity === 'error') ? 'error' : row.results.some((r) => r.severity === 'warning') ? 'warning' : 'ok';
  console.log(`${icon[worst]} ${row.code} (${row.group})`);
  for (const r of row.results) if (r.severity !== 'ok') console.log(`     ${icon[r.severity]} ${r.check}: ${r.detail}`);
}
if (unconfigured.length) {
  console.log('\nRules in Okta for helpline groups without okta config in twilio-iac (adopt them with runbook B):');
  for (const r of unconfigured) console.log(`  - "${r.name}" (${r.status}) → ${r.groupNames.join(', ')}: ${r.expression}`);
}

if (args.out) {
  const escape = (s) => String(s).replace(/\|/g, '\\|');
  const lines = [
    '# Okta group rules audit',
    '',
    `Generated ${new Date().toISOString()}`,
    '',
    '| Helpline | Group | Status | Details |',
    '|---|---|---|---|',
    ...rows.map((row) => {
      const bad = row.results.filter((r) => r.severity !== 'ok');
      return `| ${row.code} | ${escape(row.group)} | ${bad.length ? bad.map((r) => icon[r.severity].trim()).join(' ') : '✅'} | ${escape(bad.map((r) => `${r.check}: ${r.detail}`).join('<br>') || '—')} |`;
    }),
    '',
    '## Rules for helpline groups not configured in twilio-iac',
    '',
    ...(unconfigured.length ? ['| Rule | Status | Group | Expression |', '|---|---|---|---|', ...unconfigured.map((r) => `| ${escape(r.name)} | ${r.status} | ${escape(r.groupNames.join(', '))} | \`${escape(r.expression)}\` |`)] : ['None.']),
  ];
  fs.writeFileSync(args.out, lines.join('\n') + '\n');
  console.log(`\n📄 ${args.out}`);
}

process.exit(rows.some((row) => row.results.some((r) => r.severity === 'error')) ? 1 : 0);
