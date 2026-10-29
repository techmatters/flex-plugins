// Minimal, read-only Okta Management API client for the okta scripts.
// Auth: OAuth 2.0 API Services app with private_key_jwt + DPoP (no API tokens). No npm dependencies.
//
// Environment variables:
//   OKTA_ORG_URL            default https://techmatters.okta.com
//   OKTA_CLIENT_ID          client id of a read-only API Services app (not a secret)
//   OKTA_PRIVATE_KEY_PATH   path to its private key, PEM or JWK (.json). Kept outside any repo.
//   OKTA_KEY_ID             optional "kid"; a JWK's own kid is used otherwise
//
// The private key and access tokens are never printed or written to disk.

import crypto from 'crypto';
import fs from 'fs';

const READ_SCOPES = ['okta.apps.read', 'okta.groups.read', 'okta.policies.read'];

export const orgUrl = (process.env.OKTA_ORG_URL || 'https://techmatters.okta.com').replace(/\/+$/, '');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name} (see twilio-iac/scripts/okta/README.md)`);
  return value;
}

const base64url = (input) => Buffer.from(input).toString('base64url');

function loadPrivateKey() {
  const raw = fs.readFileSync(requireEnv('OKTA_PRIVATE_KEY_PATH'), 'utf8');
  if (raw.trim().startsWith('{')) {
    const jwk = JSON.parse(raw);
    return { key: crypto.createPrivateKey({ key: jwk, format: 'jwk' }), kid: process.env.OKTA_KEY_ID || jwk.kid };
  }
  return { key: crypto.createPrivateKey(raw), kid: process.env.OKTA_KEY_ID };
}

function buildClientAssertion() {
  const clientId = requireEnv('OKTA_CLIENT_ID');
  const now = Math.floor(Date.now() / 1000);
  const { key, kid } = loadPrivateKey();
  const header = { alg: 'RS256', typ: 'JWT', ...(kid ? { kid } : {}) };
  const payload = {
    iss: clientId,
    sub: clientId,
    aud: `${orgUrl}/oauth2/v1/token`,
    iat: now,
    exp: now + 300,
    jti: crypto.randomUUID(),
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  return `${unsigned}.${crypto.sign('RSA-SHA256', Buffer.from(unsigned), key).toString('base64url')}`;
}

// DPoP: a throwaway key pair per run, kept only in memory
const dpopKeys = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
const dpopPublicJwk = dpopKeys.publicKey.export({ format: 'jwk' });

function buildDpopProof(method, url, { nonce, accessToken } = {}) {
  const { origin, pathname } = new URL(url);
  const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: dpopPublicJwk };
  const payload = {
    htm: method,
    htu: `${origin}${pathname}`,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID(),
    ...(nonce ? { nonce } : {}),
    ...(accessToken ? { ath: crypto.createHash('sha256').update(accessToken).digest('base64url') } : {}),
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = crypto.sign('sha256', Buffer.from(unsigned), { key: dpopKeys.privateKey, dsaEncoding: 'ieee-p1363' });
  return `${unsigned}.${signature.toString('base64url')}`;
}

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function requestToken(nonce) {
  const tokenUrl = `${orgUrl}/oauth2/v1/token`;
  return fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      DPoP: buildDpopProof('POST', tokenUrl, { nonce }),
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: READ_SCOPES.join(' '),
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: buildClientAssertion(),
    }),
  });
}

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt - 60_000) return cachedToken;
  let response = await requestToken();
  let body = await response.json();
  if (!response.ok && body.error === 'use_dpop_nonce') {
    response = await requestToken(response.headers.get('dpop-nonce'));
    body = await response.json();
  }
  if (!response.ok) throw new Error(`Okta token request failed (${response.status}): ${body.error} - ${body.error_description}`);
  cachedToken = body.access_token;
  cachedTokenExpiresAt = Date.now() + body.expires_in * 1000;
  return cachedToken;
}

function getNextLink(linkHeader) {
  const next = linkHeader?.split(',').find((l) => l.includes('rel="next"'));
  return next ? next.match(/<([^>]+)>/)[1] : null;
}

/**
 * GET an Okta API path, following pagination and waiting out rate limits.
 * Returns an array for list endpoints, the parsed object otherwise, or text when accept is not JSON.
 */
export async function oktaGet(path, { accept = 'application/json' } = {}) {
  let url = path.startsWith('http') ? path : `${orgUrl}${path}`;
  let results = null;

  while (url) {
    const accessToken = await getAccessToken();
    const response = await fetch(url, {
      headers: { Authorization: `DPoP ${accessToken}`, DPoP: buildDpopProof('GET', url, { accessToken }), Accept: accept },
    });

    if (response.status === 429) {
      const waitMs = Math.max(Number(response.headers.get('x-rate-limit-reset')) * 1000 - Date.now(), 1000);
      console.warn(`⏳ Okta rate limit, waiting ${Math.ceil(waitMs / 1000)}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }
    if (!response.ok) throw new Error(`GET ${url} failed (${response.status}): ${await response.text()}`);
    if (accept !== 'application/json') return response.text();

    const data = await response.json();
    if (!Array.isArray(data)) return data;
    results = (results || []).concat(data);
    url = getNextLink(response.headers.get('link'));
  }
  return results || [];
}

/** Active SAML app with exactly this label, or null. */
export async function findAppByLabel(label) {
  const apps = await oktaGet(`/api/v1/apps?q=${encodeURIComponent(label)}&limit=200`);
  const matches = apps.filter((app) => app.label === label && app.status === 'ACTIVE');
  if (matches.length > 1) throw new Error(`More than one active Okta app labelled "${label}"`);
  return matches[0] || null;
}
