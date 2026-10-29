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
 * The routing designer's routes, called from api.ts:
 *
 *   GET  /api/routing                  the designs this person can open, summarised (RoutingSummary[])
 *   GET  /api/routing/:code            a helpline's design (404 if none)
 *   PUT  /api/routing/:code            save ({ expectedRevision, design }); 0 creates it; 409 if someone else saved
 *   POST /api/routing/:code/import     Aselo staff: a design read from the live twilio-iac config (not saved)
 *
 * Helpline staff see and edit their own helplines' designs; importing is for Aselo staff.
 */
import type { Condition, RoutingDesign, RoutingSummary, StoredRouting } from '../src/routing/model';
import { routingStatusOf } from '../src/routing/model';
import { isDesignStatus } from '../src/designStatus';
import type { ApiResponse, ApiUser } from './api';
import { importRouting } from './routingImport';
import { isValidRoutingCode, RoutingStore } from './routingStore';

const MAX_DESIGN_BYTES = 2_000_000;

// Designs saved before rules had alternative groups of conditions: their conditions are one group
const upgrade = (stored: StoredRouting): StoredRouting => {
  stored.design.workflows.forEach((workflow) =>
    workflow.rules.forEach((rule) => {
      const when = rule.when as unknown[];
      if (when.length > 0 && !Array.isArray(when[0])) rule.when = [when as Condition[]];
    }),
  );
  // Designs saved before they were marked imported: imported ones have their workflows' templates
  if (stored.design.imported === undefined && stored.design.workflows.some((workflow) => workflow.template)) {
    stored.design.imported = true;
  }
  return stored;
};

const ok = (body: unknown, status = 200): ApiResponse => ({ status, body });
const fail = (status: number, message: string, extra: object = {}): ApiResponse => ({
  status,
  body: { message, ...extra },
});

const canOpen = (user: ApiUser, code: string) => user.helplines === 'all' || user.helplines.includes(code);

const isDesign = (value: unknown): value is RoutingDesign => {
  const design = value as RoutingDesign;
  return (
    typeof design === 'object' &&
    design !== null &&
    typeof design.schemaVersion === 'number' &&
    Array.isArray(design.workflows) &&
    Array.isArray(design.queues) &&
    Array.isArray(design.skills) &&
    typeof design.capacity === 'object' &&
    (design.status === undefined || isDesignStatus(design.status))
  );
};

export const handleRoutingRequest = async (
  store: RoutingStore | undefined,
  helplinesConfigDir: string | undefined,
  method: string,
  path: string,
  body: unknown,
  user: ApiUser,
  now: string,
): Promise<ApiResponse> => {
  if (!store) return fail(501, "The routing designer isn't set up here.");
  if (method === 'GET' && path === '/api/routing') {
    const codes = (await store.list()).filter((code) => canOpen(user, code)).sort();
    const found = await Promise.all(
      codes.map(async (code) => {
        const stored = await store.get(code);
        return stored && upgrade(stored);
      }),
    );
    return ok(
      found
        .filter((stored): stored is StoredRouting => Boolean(stored))
        .map((stored): RoutingSummary => ({
          code: stored.code,
          meta: stored.meta,
          status: routingStatusOf(stored.design),
          isNew: !stored.design.imported,
          workflows: stored.design.workflows.length,
          queues: stored.design.queues.length,
        })),
    );
  }
  const match = path.match(/^\/api\/routing\/([^/]+)(\/import)?$/);
  if (!match) return fail(404, `Unknown API route ${method} ${path}`);
  const [, code, importing] = match;
  if (!isValidRoutingCode(code)) return fail(400, `Invalid helpline ${code}`);
  if (!canOpen(user, code)) return fail(403, `You don't have access to ${code}.`);

  if (importing) {
    if (method !== 'POST') return fail(404, `Unknown API route ${method} ${path}`);
    if (user.role !== 'aselo-staff') return fail(403, 'Only Aselo staff import routing.');
    if (!helplinesConfigDir) return fail(501, "The helplines' config isn't available here.");
    return ok(await importRouting(helplinesConfigDir, code));
  }

  const found = await store.get(code);
  const existing = found && upgrade(found);
  if (method === 'GET') return existing ? ok(existing) : fail(404, 'No routing design yet.');

  if (method === 'PUT') {
    // For now helpline staff see their routing design but don't change it
    if (user.role !== 'aselo-staff') return fail(403, 'Only Aselo staff change routing designs for now.');
    const { expectedRevision, design } = (body ?? {}) as {
      expectedRevision?: unknown;
      design?: unknown;
    };
    if (typeof expectedRevision !== 'number' || !isDesign(design)) return fail(400, 'Invalid routing design');
    if (JSON.stringify(design).length > MAX_DESIGN_BYTES) return fail(413, 'This design is too big to save.');
    const revision = existing?.meta.revision ?? 0;
    if (expectedRevision !== revision) {
      return fail(409, 'This design was changed by someone else.', {
        updatedBy: existing?.meta.updatedBy,
        updatedAt: existing?.meta.updatedAt,
        revision,
      });
    }
    const saved: StoredRouting = {
      code,
      meta: {
        revision: revision + 1,
        createdAt: existing?.meta.createdAt ?? now,
        createdBy: existing?.meta.createdBy ?? user.name,
        updatedAt: now,
        updatedBy: user.name,
      },
      design: { ...design, helpline: code },
    };
    await store.put(saved);
    return ok(saved.meta);
  }

  return fail(404, `Unknown API route ${method} ${path}`);
};
