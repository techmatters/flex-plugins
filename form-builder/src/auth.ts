/**
 * Copyright (C) 2021-2026 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/**
 * Okta sign-in, deployed only. The site serves /config.json ({ issuer, clientId }, written by
 * Terraform); without it (locally) there's no sign-in and the API treats you as Aselo staff.
 *
 * Authorization code + PKCE, no client secret, no library: redirect to Okta, come back to
 * /login/callback with a code, swap it for tokens. The access token goes with every API call; it
 * lasts 8 hours, then the next call signs in again (usually without a password, as Okta still
 * has a session). Tokens are kept per browser tab (sessionStorage).
 */

export type AuthConfig = { issuer: string; clientId: string };

type Tokens = { accessToken: string; idToken?: string; expiresAt: number };

const TOKENS_KEY = 'form-builder.tokens';
const PENDING_KEY = 'form-builder.signin';
const CALLBACK_PATH = '/login/callback';

let config: AuthConfig | undefined;

const redirectUri = () => `${window.location.origin}${CALLBACK_PATH}`;

const base64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const randomString = () => base64Url(crypto.getRandomValues(new Uint8Array(32)));

const challengeFor = async (verifier: string) =>
  base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));

const readTokens = (): Tokens | undefined => {
  try {
    const tokens = JSON.parse(sessionStorage.getItem(TOKENS_KEY) ?? 'null') as Tokens | null;
    // A minute's margin, so a call doesn't go out with a token about to expire
    return tokens && tokens.expiresAt - 60_000 > Date.now() ? tokens : undefined;
  } catch {
    return undefined;
  }
};

export const loadAuthConfig = async (fetchImpl: typeof fetch = fetch): Promise<AuthConfig | undefined> => {
  try {
    const response = await fetchImpl('/config.json', { cache: 'no-store' });
    if (!response.ok) return undefined;
    const body = await response.json();
    return typeof body?.issuer === 'string' && typeof body?.clientId === 'string'
      ? { issuer: body.issuer.replace(/\/+$/, ''), clientId: body.clientId }
      : undefined;
  } catch {
    return undefined;
  }
};

export const startSignIn = async (authConfig: AuthConfig, returnTo = window.location.pathname + window.location.search) => {
  const state = randomString();
  const verifier = randomString();
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ state, verifier, returnTo: returnTo === '/login' ? '/' : returnTo }));
  const params = new URLSearchParams({
    client_id: authConfig.clientId,
    response_type: 'code',
    scope: 'openid profile email',
    redirect_uri: redirectUri(),
    state,
    code_challenge: await challengeFor(verifier),
    code_challenge_method: 'S256',
  });
  window.location.assign(`${authConfig.issuer}/v1/authorize?${params}`);
};

// Back from Okta: swap the code for tokens; returns where to go next
export const completeSignIn = async (authConfig: AuthConfig, fetchImpl: typeof fetch = fetch): Promise<string> => {
  const query = new URLSearchParams(window.location.search);
  const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null') as
    | { state: string; verifier: string; returnTo: string }
    | null;
  sessionStorage.removeItem(PENDING_KEY);
  if (query.get('error')) throw new Error(query.get('error_description') ?? query.get('error')!);
  if (!pending || query.get('state') !== pending.state || !query.get('code')) {
    throw new Error('The sign-in could not be completed. Please try again.');
  }
  const response = await fetchImpl(`${authConfig.issuer}/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: authConfig.clientId,
      redirect_uri: redirectUri(),
      code: query.get('code')!,
      code_verifier: pending.verifier,
    }),
  });
  if (!response.ok) throw new Error(`The sign-in could not be completed (${response.status}). Please try again.`);
  const body = (await response.json()) as { access_token: string; id_token?: string; expires_in: number };
  const tokens: Tokens = {
    accessToken: body.access_token,
    idToken: body.id_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  };
  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  return pending.returnTo || '/';
};

/**
 * Called once before the app renders. Returns true when the app can render now; false when the
 * page is on its way to Okta.
 */
export const initAuth = async (fetchImpl: typeof fetch = fetch): Promise<boolean> => {
  config = await loadAuthConfig(fetchImpl);
  if (!config) return true;
  if (window.location.pathname === CALLBACK_PATH) {
    const returnTo = await completeSignIn(config, fetchImpl);
    window.history.replaceState(null, '', returnTo);
    return true;
  }
  if (window.location.pathname === '/login' || !readTokens()) {
    await startSignIn(config);
    return false;
  }
  return true;
};

export const isSignInEnabled = () => config !== undefined;

// fetch for the API: adds the token, and signs in again when it's no longer accepted
export const apiFetch = async (input: string, init: RequestInit = {}): Promise<Response> => {
  if (!config) return fetch(input, init);
  const tokens = readTokens();
  if (!tokens) {
    await startSignIn(config);
    return new Promise<Response>(() => {}); // the page is leaving
  }
  const response = await fetch(input, {
    ...init,
    headers: { ...(init.headers as Record<string, string>), Authorization: `Bearer ${tokens.accessToken}` },
  });
  if (response.status === 401) {
    sessionStorage.removeItem(TOKENS_KEY);
    await startSignIn(config);
    return new Promise<Response>(() => {});
  }
  return response;
};

export const signOut = () => {
  if (!config) return;
  const idToken = readTokens()?.idToken;
  sessionStorage.removeItem(TOKENS_KEY);
  const params = new URLSearchParams({
    client_id: config.clientId,
    post_logout_redirect_uri: `${window.location.origin}/`,
  });
  if (idToken) params.set('id_token_hint', idToken);
  window.location.assign(`${config.issuer}/v1/logout?${params}`);
};

// For tests
export const setAuthConfigForTests = (authConfig: AuthConfig | undefined) => {
  config = authConfig;
};
