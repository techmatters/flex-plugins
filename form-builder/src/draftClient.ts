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
 * Talks to the API (server/api.ts) over HTTP. Tests use draftClient.inProcess.ts, which runs
 * the same server code directly. Only types are imported from the server here, so no Node code
 * ends up in the browser bundle.
 */
import type { ApiUser, ApplyResult } from '../server/api';
import type { Draft, DraftMeta, DraftSummary } from '../server/drafts';

export type SaveDraftRequest = {
  expectedRevision: number;
  files: Record<string, unknown>;
  baseHashes: Record<string, string>;
};

export type SaveOutcome =
  | { ok: true; meta: Partial<DraftMeta> & { revision: number } }
  | { ok: false; conflict: { updatedBy?: string; updatedAt?: string } };

export type DraftClient = {
  me(): Promise<ApiUser>;
  load(code: string, version: string): Promise<Draft | undefined>;
  save(code: string, version: string, request: SaveDraftRequest): Promise<SaveOutcome>;
  // The draft's revision afterwards: 0, unless it still holds changes this person can't see
  discard(code: string, version: string): Promise<number>;
  submit(code: string, version: string): Promise<DraftMeta>;
  // description: the change log, for the PR the deployed Apply opens
  apply(code: string, version: string, description?: string): Promise<ApplyResult>;
  list(): Promise<DraftSummary[]>;
};

export type Send = (method: string, path: string, body?: unknown) => Promise<{ status: number; body: any }>;

export const clientFor = (send: Send): DraftClient => {
  const expectOk = async (method: string, path: string, body?: unknown) => {
    const response = await send(method, path, body);
    if (response.status >= 400) {
      throw new Error(response.body?.message ?? `Request failed (${response.status})`);
    }
    return response.body;
  };
  return {
    me: () => expectOk('GET', '/api/me'),
    async load(code, version) {
      const response = await send('GET', `/api/drafts/${code}/${version}`);
      if (response.status === 404) return undefined;
      if (response.status >= 400) throw new Error(response.body?.message ?? 'Could not load the draft');
      return response.body;
    },
    async save(code, version, request) {
      const response = await send('PUT', `/api/drafts/${code}/${version}`, request);
      if (response.status === 409) {
        return { ok: false, conflict: { updatedBy: response.body?.updatedBy, updatedAt: response.body?.updatedAt } };
      }
      if (response.status >= 400) throw new Error(response.body?.message ?? 'Could not save the draft');
      return { ok: true, meta: response.body };
    },
    discard: async (code, version) => (await expectOk('DELETE', `/api/drafts/${code}/${version}`))?.revision ?? 0,
    submit: (code, version) => expectOk('POST', `/api/drafts/${code}/${version}/submit`),
    apply: (code, version, description) =>
      expectOk('POST', `/api/drafts/${code}/${version}/apply`, description === undefined ? undefined : { description }),
    list: () => expectOk('GET', '/api/drafts'),
  };
};

export const httpDraftClient: DraftClient = clientFor(async (method, path, body) => {
  const response = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => undefined) };
});
