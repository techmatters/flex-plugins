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

// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiFetch, initAuth, setAuthConfigForTests } from './auth';

const CONFIG = { issuer: 'https://techmatters.okta.com/oauth2/abc', clientId: 'client-1' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// jsdom can't navigate, so location.assign is recorded instead
const recordNavigation = () => {
  const assign = vi.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, assign, origin: 'https://form-builder.tl.techmatters.org', pathname: '/', search: '' },
  });
  return assign;
};
const at = (pathname: string, search = '') => {
  Object.assign(window.location, { pathname, search });
};

afterEach(() => {
  sessionStorage.clear();
  setAuthConfigForTests(undefined);
  vi.unstubAllGlobals();
});

describe('signing in', () => {
  test('locally (no /config.json) there is none', async () => {
    expect(await initAuth(async () => new Response('<html>', { status: 200 }))).toBe(true);
  });

  test('deployed: off to Okta with PKCE, back with a code, then API calls carry the token', async () => {
    const assign = recordNavigation();
    at('/', '?helpline=usnm');
    expect(await initAuth(async () => json(CONFIG))).toBe(false);

    const authorizeUrl = new URL(assign.mock.calls[0][0]);
    expect(authorizeUrl.origin + authorizeUrl.pathname).toBe(`${CONFIG.issuer}/v1/authorize`);
    expect(authorizeUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(authorizeUrl.searchParams.get('redirect_uri')).toBe('https://form-builder.tl.techmatters.org/login/callback');
    const state = authorizeUrl.searchParams.get('state');

    // Back from Okta
    at('/login/callback', `?code=the-code&state=${state}`);
    const replaceState = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    const fetchImpl = vi.fn(async (url: string | URL | Request, _init?: RequestInit) =>
      String(url).endsWith('/config.json')
        ? json(CONFIG)
        : json({ access_token: 'access-1', id_token: 'id-1', expires_in: 28800 }),
    );
    expect(await initAuth(fetchImpl as typeof fetch)).toBe(true);
    const tokenBody = fetchImpl.mock.calls[1][1]!.body as URLSearchParams;
    expect(tokenBody.get('code')).toBe('the-code');
    expect(tokenBody.get('code_verifier')).toBeTruthy();
    expect(replaceState).toHaveBeenCalledWith(null, '', '/?helpline=usnm');

    const apiCall = vi.fn(async (_url: string, _init?: RequestInit) => json({}));
    vi.stubGlobal('fetch', apiCall);
    await apiFetch('/api/me');
    expect((apiCall.mock.calls[0][1]!.headers as Record<string, string>).Authorization).toBe('Bearer access-1');
  });

  test('a callback that doesn’t match the sign-in it started is refused', async () => {
    recordNavigation();
    sessionStorage.setItem('form-builder.signin', JSON.stringify({ state: 'mine', verifier: 'v', returnTo: '/' }));
    at('/login/callback', '?code=x&state=someone-elses');
    await expect(initAuth(async () => json(CONFIG))).rejects.toThrow(/could not be completed/);
  });
});
