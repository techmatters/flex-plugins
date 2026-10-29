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
 * Talks to the routing designer's routes (server/routingApi.ts). Tests run the same server code in
 * process through the Send.
 */
import { apiFetch } from '../auth';
import type { Send } from '../draftClient';
import type { RoutingImport } from '../../server/routingImport';
import type { BranchChoice, FromBranch } from '../../server/branches';
import type { RoutingDesign, RoutingMeta, RoutingSummary, StoredRouting } from './model';

export type RoutingSaveOutcome =
  { ok: true; meta: RoutingMeta } | { ok: false; conflict: { updatedBy?: string; updatedAt?: string } };

export type RoutingClient = {
  list(): Promise<RoutingSummary[]>;
  // undefined when the helpline has no design yet
  load(code: string): Promise<StoredRouting | undefined>;
  save(code: string, expectedRevision: number, design: RoutingDesign): Promise<RoutingSaveOutcome>;
  // From the default config, or a flex-plugins branch
  previewImport(code: string, branch?: string): Promise<RoutingImport & FromBranch>;
  branches(): Promise<BranchChoice[]>;
};

export const routingClientFor = (send: Send): RoutingClient => {
  const expectOk = async (method: string, path: string, body?: unknown) => {
    const response = await send(method, path, body);
    if (response.status >= 400) throw new Error(response.body?.message ?? `Request failed (${response.status})`);
    return response.body;
  };
  return {
    list: () => expectOk('GET', '/api/routing'),
    async load(code) {
      const response = await send('GET', `/api/routing/${code}`);
      if (response.status === 404) return undefined;
      if (response.status >= 400) throw new Error(response.body?.message ?? 'Could not load the routing design');
      return response.body;
    },
    async save(code, expectedRevision, design) {
      const response = await send('PUT', `/api/routing/${code}`, { expectedRevision, design });
      if (response.status === 409) {
        return {
          ok: false,
          conflict: { updatedBy: response.body?.updatedBy, updatedAt: response.body?.updatedAt },
        };
      }
      if (response.status >= 400) throw new Error(response.body?.message ?? 'Could not save the routing design');
      return { ok: true, meta: response.body };
    },
    previewImport: (code, branch) => expectOk('POST', `/api/routing/${code}/import`, branch ? { branch } : undefined),
    branches: () => expectOk('GET', '/api/branches'),
  };
};

export const httpRoutingClient: RoutingClient = routingClientFor(async (method, path, body) => {
  const response = await apiFetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => undefined) };
});
