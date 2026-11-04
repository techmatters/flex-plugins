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
 * Talks to GitHub as the "Aselo Form Builder" GitHub App (see terraform/README.md): reads
 * flex-plugins master and opens the Apply PRs. The app signs a short JWT with its private key,
 * swaps it for an installation token (valid 1 hour) and uses that for every call.
 */
import { createSign } from 'crypto';

export type GitHubAppCredentials = {
  appId: string;
  installationId: string;
  privateKey: string;
};

export type GitHubRepo = { owner: string; repo: string };

export const FLEX_PLUGINS: GitHubRepo = { owner: 'techmatters', repo: 'flex-plugins' };

const API = 'https://api.github.com';

const base64Url = (input: string | Buffer) => Buffer.from(input).toString('base64url');

export const createAppJwt = (appId: string, privateKey: string, now = Date.now()) => {
  const issuedAt = Math.floor(now / 1000) - 60; // GitHub allows for clock drift this way
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({ iat: issuedAt, exp: issuedAt + 9 * 60, iss: appId }));
  const signature = createSign('RSA-SHA256').update(`${header}.${payload}`).sign(privateKey);
  return `${header}.${payload}.${base64Url(signature)}`;
};

export class GitHubError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export class GitHubClient {
  private token?: { value: string; expiresAt: number };

  constructor(
    private readonly credentials: GitHubAppCredentials,
    readonly repo: GitHubRepo = FLEX_PLUGINS,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private async installationToken() {
    // Renewed 5 minutes before it expires
    if (this.token && this.token.expiresAt - 5 * 60 * 1000 > Date.now()) return this.token.value;
    const { appId, installationId, privateKey } = this.credentials;
    const response = await this.fetchImpl(`${API}/app/installations/${installationId}/access_tokens`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${createAppJwt(appId, privateKey)}`,
        'User-Agent': 'aselo-form-builder',
      },
    });
    if (!response.ok) throw new GitHubError(`GitHub sign-in failed (${response.status})`, response.status);
    const body = (await response.json()) as { token: string; expires_at: string };
    this.token = { value: body.token, expiresAt: Date.parse(body.expires_at) };
    return body.token;
  }

  // A call to the repo's API, e.g. request('GET', '/commits/master'); returns the raw response
  async raw(method: string, repoPath: string, body?: unknown, accept = 'application/vnd.github+json') {
    const { owner, repo } = this.repo;
    const response = await this.fetchImpl(`${API}/repos/${owner}/${repo}${repoPath}`, {
      method,
      headers: {
        Accept: accept,
        Authorization: `Bearer ${await this.installationToken()}`,
        'User-Agent': 'aselo-form-builder',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new GitHubError(`GitHub ${method} ${repoPath} failed (${response.status}) ${detail}`.trim(), response.status);
    }
    return response;
  }

  async request<T>(method: string, repoPath: string, body?: unknown): Promise<T> {
    return (await (await this.raw(method, repoPath, body)).json()) as T;
  }

  // The commit master points at now
  async headSha(branch = 'master') {
    const response = await this.raw('GET', `/commits/${branch}`, undefined, 'application/vnd.github.sha');
    return (await response.text()).trim();
  }

  // The repo at a commit, as a .tar.gz
  async tarball(sha: string) {
    return Buffer.from(await (await this.raw('GET', `/tarball/${sha}`)).arrayBuffer());
  }
}
