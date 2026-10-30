// Checks an Okta app (as returned by GET /api/v1/apps/{id}) against the Aselo Flex SAML standard.
// The attribute list comes from the same JSON file the flex-saml-app Terraform module uses.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { flexAudience, flexCallbackUrl } from './flex.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const standardFile = path.resolve(here, '../../../terraform-modules/okta/flex-saml-app/attribute-statements.json');
export const standardAttributes = JSON.parse(fs.readFileSync(standardFile, 'utf8')).attributes;

const NAMESPACE_URNS = {
  basic: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
  uri: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
  unspecified: 'urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified',
};

// Fixed SAML settings every Flex app must have (same values as terraform-modules/okta/flex-saml-app/main.tf)
const REQUIRED_SIGN_ON = {
  signatureAlgorithm: 'RSA_SHA256',
  digestAlgorithm: 'SHA256',
  responseSigned: true,
  assertionSigned: true,
  subjectNameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
  subjectNameIdTemplate: '${user.userName}',
  idpIssuer: 'http://www.okta.com/${org.externalKey}',
  authnContextClassRef: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
  honorForceAuthn: true,
};

/** Attributes an app should send, in order: standard (+ optional sets) then helpline extras. */
export function expectedAttributes({ optionalAttributeSets = [], extraAttributeStatements = [] } = {}) {
  return [
    ...standardAttributes.filter((a) => !a.optional_set || optionalAttributeSets.includes(a.optional_set)),
    ...extraAttributeStatements.map((a) => ({ namespace: 'basic', ...a })),
  ];
}

const result = (check, ok, detail = '', severity = 'error') => ({ check, ok, detail, severity: ok ? 'ok' : severity });

/**
 * @param app            Okta app object
 * @param expected       { attributeStatementsMode, optionalAttributeSets, extraAttributeStatements, groupNames } (groupNames optional)
 * @param context        { flexConnectionSid, assignedGroupNames, federatedClaims }
 * @returns list of { check, ok, detail, severity }
 */
export function checkApp(app, expected, { flexConnectionSid, assignedGroupNames, federatedClaims = [] } = {}) {
  const results = [];
  const signOn = app.settings?.signOn ?? {};

  results.push(result('App is an active SAML 2.0 app', app.status === 'ACTIVE' && app.signOnMode === 'SAML_2_0', `${app.status} ${app.signOnMode}`));

  const wrongSettings = Object.entries(REQUIRED_SIGN_ON)
    .filter(([key, value]) => signOn[key] !== value)
    .map(([key, value]) => `${key}=${JSON.stringify(signOn[key])} (expected ${JSON.stringify(value)})`);
  if (signOn.assertionEncryption?.enabled) wrongSettings.push('assertionEncryption enabled (Flex does not support it)');
  results.push(result('SAML security settings (SHA-256, signed response + assertion)', wrongSettings.length === 0, wrongSettings.join('; ')));

  // Flex connection: the app must point at the Flex SSO connection of its Twilio account
  const urlConnection = /connection=(JQ[0-9a-f]{32})/.exec(signOn.ssoAcsUrl || '')?.[1];
  if (flexConnectionSid) {
    const urlsOk = [signOn.ssoAcsUrl, signOn.recipient, signOn.destination].every((u) => u === flexCallbackUrl(flexConnectionSid));
    const audienceOk = signOn.audience === flexAudience(flexConnectionSid);
    results.push(
      result(
        'Points at the Flex SSO connection of its Twilio account',
        urlsOk && audienceOk,
        urlsOk && audienceOk ? flexConnectionSid : `app uses ${urlConnection ?? signOn.ssoAcsUrl}, Flex account has ${flexConnectionSid}`,
      ),
    );
  } else {
    results.push(result('Points at the Flex SSO connection of its Twilio account', false, `not checked (no account SID); app uses ${urlConnection ?? signOn.ssoAcsUrl}`, 'warning'));
  }

  // Attributes
  const wanted = expectedAttributes(expected);
  const legacy = signOn.attributeStatements || [];
  const mode = expected.attributeStatementsMode || 'legacy';

  const badNames = [...legacy.map((a) => a.name), ...federatedClaims.map((c) => c.name)].filter((n) => n !== n.trim());
  results.push(result('No leading/trailing spaces in attribute names', badNames.length === 0, badNames.map((n) => JSON.stringify(n)).join(', ')));

  if (mode === 'legacy') {
    // Compare by trimmed name; whitespace in names is reported by the check above
    const byName = new Map(legacy.map((a) => [a.name.trim(), a]));
    const valueOf = (a) => (a.values || []).join(',');
    const errors = [];
    const warnings = [];
    for (const want of wanted) {
      const actual = byName.get(want.name);
      if (!actual) {
        errors.push(`missing ${want.name}`);
        continue;
      }
      if (valueOf(actual).trim() !== want.legacy) errors.push(`${want.name} = ${JSON.stringify(valueOf(actual))} (expected ${JSON.stringify(want.legacy)})`);
      else if (valueOf(actual) !== want.legacy) warnings.push(`${want.name} value has extra whitespace ${JSON.stringify(valueOf(actual))}`);
      if (actual.namespace !== NAMESPACE_URNS[want.namespace]) warnings.push(`${want.name} name format ${actual.namespace.split(':').pop()} (expected ${want.namespace})`);
    }
    const unexpected = [...byName.keys()].filter((name) => !wanted.some((a) => a.name === name));
    if (unexpected.length) errors.push(`not in config: ${unexpected.join(', ')}`);
    results.push(result('Attribute statements (legacy) match the standard', errors.length === 0, errors.join('; ')));
    results.push(result('Attribute values and name formats are clean', warnings.length === 0, warnings.join('; '), 'warning'));

    const orderOk = errors.length > 0 || [...byName.keys()].join('\n') === wanted.map((a) => a.name).join('\n'); // only meaningful when the set matches
    results.push(result('Attribute statements in standard order', orderOk, orderOk ? '' : 'order differs (cosmetic)', 'warning'));
    results.push(result('No new-style attribute statements (federated claims)', federatedClaims.length === 0, federatedClaims.map((c) => c.name).join(', '), 'warning'));
  } else {
    const actual = new Map(federatedClaims.map((c) => [c.name, c.expression]));
    const missing = wanted.filter((a) => actual.get(a.name) !== a.federated).map((a) => a.name);
    const unexpected = [...actual.keys()].filter((name) => !wanted.some((a) => a.name === name));
    results.push(result('Attribute statements (federated claims) match the standard', missing.length === 0 && unexpected.length === 0, [missing.length && `missing/different: ${missing.join(', ')}`, unexpected.length && `not in config: ${unexpected.join(', ')}`].filter(Boolean).join('; ')));
    results.push(result('No legacy attribute statements left (would be sent twice)', legacy.length === 0, legacy.map((a) => a.name).join(', ')));
  }

  // Groups
  if (expected.groupNames && assignedGroupNames) {
    const missing = expected.groupNames.filter((g) => !assignedGroupNames.includes(g));
    const unexpected = assignedGroupNames.filter((g) => !expected.groupNames.includes(g));
    results.push(result('Group assignments match the configuration', missing.length === 0 && unexpected.length === 0, [missing.length && `missing: ${missing.join(', ')}`, unexpected.length && `unexpected: ${unexpected.join(', ')}`].filter(Boolean).join('; ')));
  }

  return results;
}
