// Captures the SAML assertion Okta sends to Flex for a test user, WITHOUT completing the Flex login
// (so no Flex worker is created or updated). Same flow as e2e-tests/okta/ssoLogin.ts, stopped before
// the SAMLResponse is posted to Twilio.
//
// The test user must not require MFA. Credentials come from OKTA_TEST_USERNAME / OKTA_TEST_PASSWORD
// and are never printed.

import crypto from 'crypto';
import { orgUrl } from './oktaClient.mjs';
import { getFlexSsoConnection } from './flex.mjs';

// fetch() does not keep cookies across redirects; Okta's session cookie redirect needs that.
async function fetchFollowingRedirects(url, cookies = new Map(), maxHops = 15) {
  for (let hop = 0; hop < maxHops; hop++) {
    const host = new URL(url).host;
    const cookieHeader = [...(cookies.get(host) || new Map())].map(([k, v]) => `${k}=${v}`).join('; ');
    const response = await fetch(url, { redirect: 'manual', headers: cookieHeader ? { Cookie: cookieHeader } : {} });
    for (const setCookie of response.headers.getSetCookie?.() || []) {
      const [pair] = setCookie.split(';');
      const index = pair.indexOf('=');
      if (!cookies.has(host)) cookies.set(host, new Map());
      cookies.get(host).set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
    }
    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url).toString();
      continue;
    }
    return { response, url };
  }
  throw new Error('Too many redirects');
}

const decodeHtmlEntities = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

/** Where Flex sends the browser to start SAML for this account (an Okta /sso/saml URL). */
export async function getSamlStartUrl(accountSid) {
  const connection = await getFlexSsoConnection(accountSid);
  if (!connection) throw new Error(`No Flex SSO connection for ${accountSid}`);
  const codeChallenge = crypto.createHash('sha256').update(crypto.randomUUID()).digest('base64url');
  const nonce = crypto.randomBytes(8).toString('hex');
  const authorizeUrl =
    `https://services.twilio.com/v1/Flex/Authorize?codeChallenge=${codeChallenge}&nonce=${nonce}` +
    `&redirectUrl=${encodeURIComponent('https://flex.twilio.com/agent-desktop')}&ssoProfileSid=${connection.connectionSid}`;
  const { url } = await fetchFollowingRedirects(authorizeUrl);
  const finalUrl = new URL(url);
  const samlStart = finalUrl.searchParams.get('fromURI') ?? (finalUrl.pathname.endsWith('/sso/saml') && finalUrl.searchParams.has('SAMLRequest') ? url : null);
  if (!samlStart) throw new Error(`Flex authorize did not redirect to Okta SAML (ended at ${finalUrl.origin}${finalUrl.pathname})`);
  return new URL(samlStart, orgUrl).toString();
}

/** Logs the test user into Okta and returns { destination, attributes: { name: [values] } } from the SAML assertion. */
export async function captureSamlAssertion(accountSid) {
  const username = process.env.OKTA_TEST_USERNAME;
  const password = process.env.OKTA_TEST_PASSWORD;
  if (!username || !password) throw new Error('Set OKTA_TEST_USERNAME and OKTA_TEST_PASSWORD (a test account without MFA)');

  const samlStart = await getSamlStartUrl(accountSid);

  const authn = await fetch(`${orgUrl}/api/v1/authn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password, options: { warnBeforePasswordExpired: true, multiOptionalFactorEnroll: true } }),
  });
  const authnBody = await authn.json();
  if (authnBody.status !== 'SUCCESS') throw new Error(`Okta authentication for the test user returned ${authnBody.status ?? authn.status} (MFA or wrong credentials?)`);

  const { response } = await fetchFollowingRedirects(
    `${orgUrl}/login/sessionCookieRedirect?checkAccountSetupComplete=true&token=${encodeURIComponent(authnBody.sessionToken)}&redirectUrl=${encodeURIComponent(samlStart)}`,
  );
  const html = await response.text();
  const samlResponse = /name=["']SAMLResponse["'][^>]*value=["']([^"']+)["']/i.exec(html)?.[1] ?? /value=["']([^"']+)["'][^>]*name=["']SAMLResponse["']/i.exec(html)?.[1];
  if (!samlResponse) throw new Error('No SAMLResponse in the Okta response (is the test user assigned to this app?)');

  const xml = Buffer.from(decodeHtmlEntities(samlResponse), 'base64').toString('utf8');
  const attributes = {};
  for (const [, name, inner] of xml.matchAll(/<(?:\w+:)?Attribute\b[^>]*\bName="([^"]*)"[^>]*>([\s\S]*?)<\/(?:\w+:)?Attribute>/g)) {
    attributes[name] = [...inner.matchAll(/<(?:\w+:)?AttributeValue\b[^>]*?(?:\/>|>([\s\S]*?)<\/(?:\w+:)?AttributeValue>)/g)].map(([, v]) => decodeHtmlEntities(v ?? ''));
  }
  const destination = /Destination="([^"]+)"/.exec(xml)?.[1];
  return { destination, attributes };
}
