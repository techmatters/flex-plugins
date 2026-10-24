// Loads everything the scripts need about one helpline + environment: expected settings (from the
// helpline config), the live Okta app, its groups and claims, and the Twilio/Flex SSO connection.

import { findAppByLabel, oktaGet } from './oktaClient.mjs';
import { getExpectedApp, resolveAccountSid } from './helplineConfig.mjs';
import { getFlexSsoConnection } from './flex.mjs';

export async function loadAppContext(code, environment, args = {}) {
  const configured = getExpectedApp(code, environment);
  const expected = configured ?? {
    code,
    environment,
    label: args.label,
    attributeStatementsMode: 'legacy',
    optionalAttributeSets: args.optionalSets ? String(args.optionalSets).split(',') : [],
    extraAttributeStatements: [],
  };
  if (!expected.label) {
    throw new Error(`${code}/${environment} has no okta_app config in twilio-iac/helplines; pass --label "<Okta app label>"`);
  }

  const app = await findAppByLabel(expected.label);
  const accountSid = resolveAccountSid(code, environment, args);
  const flexConnection = accountSid ? await getFlexSsoConnection(accountSid) : null;

  let assignedGroupNames = null;
  let federatedClaims = [];
  if (app) {
    const assignments = await oktaGet(`/api/v1/apps/${app.id}/groups?limit=200`);
    assignedGroupNames = await Promise.all(assignments.map(async (a) => (await oktaGet(`/api/v1/groups/${a.id}`)).profile.name));
    federatedClaims = await oktaGet(`/api/v1/apps/${app.id}/federated-claims`);
  }

  return { configured: Boolean(configured), expected, app, accountSid, flexConnection, assignedGroupNames, federatedClaims };
}

export function printResults(results) {
  const icon = { ok: '✅', warning: '⚠️ ', error: '❌' };
  for (const r of results) console.log(`${icon[r.severity]} ${r.check}${r.detail && r.severity !== 'ok' ? `\n     ${r.detail}` : r.detail ? `  (${r.detail})` : ''}`);
}
