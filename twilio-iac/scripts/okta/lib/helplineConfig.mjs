// Reads the Okta settings of a helpline from twilio-iac/helplines/<code>/{common,<env>}.hcl and derives
// what its Okta app should look like, using the SAME rules as terraform-modules/stages/okta-app.
// Only the flat `okta` / `okta_app` blocks are parsed (strings, bools, string lists, lists of flat objects).

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const helplinesDir = path.resolve(here, '../../../helplines');

// ---- minimal HCL subset parser -------------------------------------------------------------

function stripComments(text) {
  return text
    .split('\n')
    .map((line) => line.replace(/(^|\s)(#|\/\/).*$/, ''))
    .join('\n');
}

// Returns the text between the braces of `<name> = { ... }`, or null
function extractBlock(text, name) {
  const match = new RegExp(`(^|\\n)\\s*${name}\\s*=\\s*\\{`).exec(text);
  if (!match) return null;
  let depth = 0;
  const start = match.index + match[0].length;
  for (let i = start - 1; i < text.length; i++) {
    if (text[i] === '"') {
      for (i++; i < text.length && text[i] !== '"'; i++) if (text[i] === '\\') i++;
    } else if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(start, i);
  }
  throw new Error(`Unbalanced braces in ${name} block`);
}

const STRING = /"((?:[^"\\]|\\.)*)"/g;
const parseString = (raw) => JSON.parse(`"${raw}"`);

function parseFlatObject(body) {
  const result = {};
  // values: "string", true/false, [list] or { inline object } (e.g. group_rule = { organizations = ["X"] })
  const assignment = /(\w+)\s*=\s*("(?:[^"\\]|\\.)*"|true|false|\{[^{}]*\}|\[[\s\S]*?\](?=\s*(\n|$)))/g;
  for (const [, key, value] of body.matchAll(assignment)) {
    if (value === 'true' || value === 'false') result[key] = value === 'true';
    else if (value.startsWith('"')) result[key] = parseString(value.slice(1, -1));
    else if (value.startsWith('{')) result[key] = parseFlatObject(value.slice(1, -1));
    else if (value.includes('{')) result[key] = [...value.matchAll(/\{([^{}]*)\}/g)].map(([, inner]) => parseFlatObject(inner));
    else result[key] = [...value.matchAll(STRING)].map(([, s]) => parseString(s));
  }
  return result;
}

function readBlock(file, name) {
  if (!fs.existsSync(file)) return null;
  const body = extractBlock(stripComments(fs.readFileSync(file, 'utf8')), name);
  return body === null ? null : parseFlatObject(body);
}

function readString(file, key) {
  const match = new RegExp(`(^|\\n)\\s*${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(fs.readFileSync(file, 'utf8'));
  return match ? parseString(match[2]) : null;
}

// ---- helpline settings ---------------------------------------------------------------------

export function listHelplineCodes() {
  return fs
    .readdirSync(helplinesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(helplinesDir, d.name, 'common.hcl')))
    .map((d) => d.name);
}

/**
 * Expected Okta app for a helpline + environment, or null when the helpline has no okta config.
 * Mirrors terraform-modules/stages/okta-app/main.tf.
 */
export function getExpectedApp(code, environment) {
  const commonFile = path.join(helplinesDir, code, 'common.hcl');
  if (!fs.existsSync(commonFile)) throw new Error(`Unknown helpline '${code}' (no ${commonFile})`);

  const okta = readBlock(commonFile, 'okta');
  const oktaApp = readBlock(path.join(helplinesDir, code, `${environment}.hcl`), 'okta_app');
  if (!okta || !oktaApp) return null;

  const helpline = readString(commonFile, 'helpline');
  const appName = okta.app_name || helpline;
  const upperCode = code.toUpperCase();
  const label = oktaApp.label || (environment === 'production' ? `${appName} (${upperCode})` : `STG_${appName} (${upperCode})`);
  const techMattersGroups =
    oktaApp.tech_matters_groups ||
    (environment === 'production' ? ['Tech Matters - Production'] : ['Tech Matters - Staff', 'Tech Matters - Test Accounts']);
  const includeHelplineGroup = oktaApp.include_helpline_group !== false;

  return {
    code,
    environment,
    label,
    helplineGroup: okta.group_name,
    includeHelplineGroup,
    groupNames: [...(includeHelplineGroup ? [okta.group_name] : []), ...techMattersGroups],
    attributeStatementsMode: oktaApp.attribute_statements_mode || 'legacy',
    optionalAttributeSets: oktaApp.optional_attribute_sets || [],
    extraAttributeStatements: (oktaApp.extra_attribute_statements || []).map((a) => ({ namespace: 'basic', ...a })),
  };
}

/** The helpline-level `okta` block from common.hcl ({ group_name, group_rule, ... }), or null. */
export function getHelplineOkta(code) {
  const commonFile = path.join(helplinesDir, code, 'common.hcl');
  return fs.existsSync(commonFile) ? readBlock(commonFile, 'okta') : null;
}

/** Defaults for helplines not yet configured in Terraform: label parsed from the Okta app itself. */
export function parseAppLabel(label) {
  const match = /^(STG_)?(.*?)\s*\(([^)]+)\)\s*$/.exec(label);
  if (!match) return null;
  return { environment: match[1] ? 'staging' : 'production', appName: match[2], code: match[3].toLowerCase() };
}

// ---- Twilio account SID --------------------------------------------------------------------

/**
 * Account SID for a helpline + environment. Order: --account-sid, --accounts-file (private JSON
 * { "<code>": { "staging": "AC...", "production": "AC..." } }), then AWS SSM (same secret Terraform reads).
 * Only twilio_account_sid is taken from the SSM secret; nothing else is kept or printed.
 */
export function resolveAccountSid(code, environment, { accountSid, accountsFile } = {}) {
  if (accountSid) return accountSid;
  if (accountsFile) {
    const sid = JSON.parse(fs.readFileSync(accountsFile, 'utf8'))[code]?.[environment];
    if (sid) return sid;
  }
  try {
    const raw = execFileSync(
      'aws',
      ['ssm', 'get-parameter', '--name', `/terraform/twilio-iac/${environment}/${code}/secrets.json`, '--with-decryption', '--query', 'Parameter.Value', '--output', 'text'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return JSON.parse(raw).twilio_account_sid || null;
  } catch {
    return null;
  }
}
