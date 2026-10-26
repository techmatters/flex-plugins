#!/usr/bin/env node
// Creates the form definitions of a new helpline from the baseline (form-definitions/as/v3):
// copies it to form-definitions/<code>/v1, renames the helpline in HelplineInformation and
// IssueCategorizationTab, and registers <code>-v1 in the validation tests. Local files only.
//
// Usage: node newHelplineForms.mjs --hl <code> --helpline "<display name>"

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs, requireArgs } from '../okta/lib/args.mjs';

const args = parseArgs();
requireArgs(args, ['hl', 'helpline'], `
Usage: node newHelplineForms.mjs --hl <code> --helpline "<display name>"

  --helpline must be the same value as "helpline" in twilio-iac/helplines/<code>/common.hcl:
  the categories are looked up by that name.
`);

const code = String(args.hl).toLowerCase();
const helpline = String(args.helpline);
const BASELINE_NAME = 'Baseline Helpline';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const packageDir = path.join(repoRoot, 'lambdas/packages/hrm-form-definitions');
const baselineDir = path.join(packageDir, 'form-definitions/as/v3');
const targetDir = path.join(packageDir, 'form-definitions', code, 'v1');

if (fs.existsSync(targetDir)) {
  console.error(`${path.relative(repoRoot, targetDir)} already exists, not overwriting it.`);
  process.exit(1);
}

fs.cpSync(baselineDir, targetDir, { recursive: true });
fs.rmSync(path.join(targetDir, 'README.md'), { force: true });

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(targetDir, file), 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(path.join(targetDir, file), `${JSON.stringify(data, null, 2)}\n`);

// Helpline name: HelplineInformation + the categories key
const info = readJson('HelplineInformation.json');
info.helplines = info.helplines.map((h) => (h.value === BASELINE_NAME ? { ...h, label: helpline, value: helpline } : h));
writeJson('HelplineInformation.json', info);

const categories = readJson('tabbedForms/IssueCategorizationTab.json');
writeJson('tabbedForms/IssueCategorizationTab.json', { [helpline]: categories[BASELINE_NAME] });

// Register <code>-v1 so `npm test` validates the new definitions
const enumFile = path.join(packageDir, 'src/__tests__/definitionVersionId.ts');
const enumSource = fs.readFileSync(enumFile, 'utf8');
const enumKey = `${code.replace(/[^a-z0-9]/g, '')}V1`;
if (!enumSource.includes(`'${code}-v1'`)) {
  const eol = enumSource.includes('\r\n') ? '\r\n' : '\n';
  const updated = enumSource.replace(/\n}\s*$/, `\n  ${enumKey} = '${code}-v1', // ${helpline} v1${eol}}${eol}`);
  fs.writeFileSync(enumFile, updated);
}

console.log(`Created ${path.relative(repoRoot, targetDir)} from the baseline (as/v3) for "${helpline}".

Next:
  1. Set "definitionVersion": "${code}-v1" in twilio-iac/helplines/${code}/configs/service-configuration/common.json
  2. Fill in HelplineInformation.json (manager name, phone, email) and adapt the forms to the helpline
  3. cd lambdas/packages/hrm-form-definitions && npm test -- validateDefinitions   (must pass)
  4. Deploy: GitHub Actions › "Deploy form-definitions to S3" with helpline_code=${code}`);
