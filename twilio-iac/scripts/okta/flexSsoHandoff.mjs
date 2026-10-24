#!/usr/bin/env node
// Step 3 (the manual step): print the three values to paste into Twilio Console > Flex > Single sign-on (SSO).
// Read-only. Twilio has no documented API for these Flex SSO settings, so a person enters them.

import { parseArgs, requireArgs, normalizeEnvironment } from './lib/args.mjs';
import { oktaGet } from './lib/oktaClient.mjs';
import { loadAppContext } from './lib/appContext.mjs';

const args = parseArgs();
requireArgs(args, ['hl', 'env'], `
Usage: node flexSsoHandoff.mjs --hl <short code> --env <staging|production> [--label "<Okta app label>"] [--account-sid AC...]

Prints the Identity Provider Issuer, Single Sign-on URL and X.509 certificate of the helpline's Okta app,
ready to paste into the Flex SSO page, plus the Flex connection check.
`);

const environment = normalizeEnvironment(args.env);
const ctx = await loadAppContext(args.hl, environment, args);
if (!ctx.app) {
  console.error(`❌ No active Okta app labelled "${ctx.expected.label}". Run the okta-app stage first.`);
  process.exit(1);
}

const metadata = await oktaGet(`/api/v1/apps/${ctx.app.id}/sso/saml/metadata`, { accept: 'application/xml' });
const issuer = /entityID="([^"]+)"/.exec(metadata)?.[1];
const ssoUrl = /SingleSignOnService[^>]*Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"[^>]*Location="([^"]+)"/.exec(metadata)?.[1];
const certificate = /<ds:X509Certificate>([\s\S]*?)<\/ds:X509Certificate>/.exec(metadata)?.[1].replace(/\s+/g, '');
const pem = `-----BEGIN CERTIFICATE-----\n${certificate.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----`;

console.log(`
Okta app: ${ctx.app.label}
Twilio account: ${ctx.accountSid ?? '(unknown: pass --account-sid)'}

In Twilio Console for that account: Flex > Users and access > Single sign-on (SSO), enter:

  Identity Provider Issuer:
    ${issuer}

  Single Sign-on URL:
    ${ssoUrl}

  X.509 Certificate (public, safe to copy):
${pem}
`);

if (ctx.flexConnection) {
  const appConnection = /connection=(JQ[0-9a-f]{32})/.exec(ctx.app.settings.signOn.ssoAcsUrl)?.[1];
  const match = appConnection === ctx.flexConnection.connectionSid;
  console.log(`${match ? '✅' : '❌'} Okta app points at Flex connection ${appConnection}; the account's connection is ${ctx.flexConnection.connectionSid}`);
}
console.log('Afterwards run: node verifySso.mjs --hl', args.hl, '--env', environment, '[--login]');
