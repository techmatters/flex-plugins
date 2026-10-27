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
 * The form builder's API, independent of where it runs: the Vite dev server calls it locally
 * (devApiPlugin.ts) and the deployed Lambda will call it behind API Gateway.
 *
 *   GET    /api/me                                  who's signed in and what they can do
 *   GET    /api/helplines                           helplines this person can open
 *   GET    /api/definitions/:code/:version          the current (applied) files
 *   GET    /api/drafts                              drafts this person can see
 *   GET    /api/drafts/:code/:version               a draft (404 if there's none)
 *   PUT    /api/drafts/:code/:version               save a draft
 *   DELETE /api/drafts/:code/:version               discard a draft
 *   POST   /api/drafts/:code/:version/submit        helpline staff: send for review
 *   POST   /api/drafts/:code/:version/apply         Aselo staff only: apply a draft
 *
 * Roles: Aselo staff can do everything for every helpline. Helpline staff only see their own
 * helplines, can't apply, and never see or change the service configuration
 * (service-configuration/*.json). Deployed, both come from Okta groups.
 */
import { DefinitionsApiError, listHelplines, loadDefinitionFiles } from './definitionsApi';
import { Draft, DraftStore, isValidDraftFilePath, isValidDraftKey } from './drafts';
import { isServiceConfigPath } from './filePaths';

export type ApiUser = {
  name: string;
  email?: string;
  role: 'aselo-staff' | 'helpline-staff';
  // Helpline codes this person works on; Aselo staff have all of them
  helplines: string[] | 'all';
};

export type ApiRequest = {
  method: string;
  path: string;
  body?: unknown;
  user: ApiUser;
};

export type ApiResponse = { status: number; body: unknown };

export type ApplyResult = {
  // Where the changes went: files written locally, or the branch / PR when deployed
  description: string;
  written: string[];
  link?: string;
};

export interface DraftApplier {
  apply(draft: Draft, user: ApiUser): Promise<ApplyResult>;
}

export interface Notifier {
  draftSubmitted(draft: Draft, user: ApiUser): Promise<void>;
}

export type ApiContext = {
  formDefinitionsDir: string;
  helplinesConfigDir?: string;
  // aselo-webchat-react-app/configSrc, for the webchat's translations and settings
  webchatConfigDir?: string;
  drafts: DraftStore;
  applier: DraftApplier;
  notifier: Notifier;
  now?: () => Date;
};

type SaveDraftBody = {
  // The revision the person started from; 0 when there was no draft
  expectedRevision: number;
  files: Record<string, unknown>;
  baseHashes: Record<string, string>;
};

const ok = (body: unknown, status = 200): ApiResponse => ({ status, body });
const fail = (status: number, message: string, extra: object = {}): ApiResponse => ({
  status,
  body: { message, ...extra },
});

export const canOpenHelpline = (user: ApiUser, code: string) =>
  user.helplines === 'all' || user.helplines.includes(code);

// The service configuration is Aselo staff business: helpline staff never see it, in the
// current files or in drafts
const isStaff = (user: ApiUser) => user.role === 'aselo-staff';
const pickFiles = <T>(files: Record<string, T>, serviceConfig: boolean) =>
  Object.fromEntries(Object.entries(files).filter(([filePath]) => isServiceConfigPath(filePath) === serviceConfig));

const draftForUser = (draft: Draft, user: ApiUser): Draft =>
  isStaff(user)
    ? draft
    : {
        ...draft,
        files: pickFiles(draft.files, false),
        meta: { ...draft.meta, baseHashes: pickFiles(draft.meta.baseHashes, false) },
      };

const isSaveDraftBody = (body: unknown): body is SaveDraftBody => {
  const candidate = body as SaveDraftBody;
  return (
    typeof candidate?.expectedRevision === 'number' &&
    typeof candidate.files === 'object' &&
    candidate.files !== null &&
    typeof candidate.baseHashes === 'object' &&
    candidate.baseHashes !== null
  );
};

export const handleApiRequest = async (
  context: ApiContext,
  request: ApiRequest,
): Promise<ApiResponse> => {
  const { user } = request;
  const now = (context.now ?? (() => new Date()))().toISOString();
  const route = `${request.method.toUpperCase()} ${request.path.replace(/\/+$/, '')}`;

  try {
    if (route === 'GET /api/me') return ok(user);

    if (route === 'GET /api/helplines') {
      const helplines = await listHelplines(context.formDefinitionsDir);
      return ok(helplines.filter((helpline) => canOpenHelpline(user, helpline.code)));
    }

    if (route === 'GET /api/drafts') {
      const drafts = await context.drafts.list();
      return ok(drafts.filter((draft) => canOpenHelpline(user, draft.code)));
    }

    const definitionsMatch = route.match(/^GET \/api\/definitions\/([^/]+)\/([^/]+)$/);
    if (definitionsMatch) {
      const [, code, version] = definitionsMatch;
      if (!canOpenHelpline(user, code)) return fail(403, `You don't have access to ${code}.`);
      const definitions = await loadDefinitionFiles(
        context.formDefinitionsDir,
        code,
        version,
        context.helplinesConfigDir,
        context.webchatConfigDir,
      );
      if (isStaff(user)) return ok(definitions);
      return ok({ ...definitions, files: pickFiles(definitions.files, false), serviceConfigDefaults: undefined });
    }

    const draftMatch = route.match(/^(GET|PUT|DELETE|POST) \/api\/drafts\/([^/]+)\/([^/]+)(\/submit|\/apply)?$/);
    if (!draftMatch) return fail(404, `Unknown API route ${route}`);

    const [, method, code, version, action] = draftMatch;
    if (!isValidDraftKey(code, version)) return fail(400, `Invalid helpline or version ${code}/${version}`);
    if (!canOpenHelpline(user, code)) return fail(403, `You don't have access to ${code}.`);
    const existing = await context.drafts.get(code, version);

    if (method === 'GET' && !action) {
      return existing ? ok(draftForUser(existing, user)) : fail(404, 'No draft');
    }

    if (method === 'PUT' && !action) {
      if (!isSaveDraftBody(request.body)) return fail(400, 'Invalid draft');
      const { expectedRevision, baseHashes } = request.body;
      let { files } = request.body;
      if (!isStaff(user)) {
        if (Object.keys(files).some(isServiceConfigPath)) {
          return fail(403, 'Only Aselo staff can change the service configuration');
        }
        // Keep the service configuration changes Aselo staff made in this draft
        files = { ...files, ...pickFiles(existing?.files ?? {}, true) };
      }
      const invalidPath = Object.keys(files).find((filePath) => !isValidDraftFilePath(filePath));
      if (invalidPath) return fail(400, `Invalid file path ${invalidPath}`);

      // Someone else saved since this person loaded the draft
      const currentRevision = existing?.meta.revision ?? 0;
      if (expectedRevision !== currentRevision) {
        return fail(409, 'This draft was changed by someone else.', {
          updatedBy: existing?.meta.updatedBy,
          updatedAt: existing?.meta.updatedAt,
          revision: currentRevision,
        });
      }

      // Nothing left that differs from the current files: no draft
      if (Object.keys(files).length === 0) {
        if (existing) await context.drafts.remove(code, version);
        return ok({ revision: 0, status: 'editing' });
      }

      // Editing a submitted draft takes it back out of review
      const draft: Draft = {
        code,
        version,
        files,
        meta: {
          revision: currentRevision + 1,
          status: 'editing',
          updatedAt: now,
          updatedBy: user.name,
          baseHashes: { ...(existing?.meta.baseHashes ?? {}), ...baseHashes },
        },
      };
      await context.drafts.put(draft);
      return ok(draftForUser(draft, user).meta);
    }

    if (method === 'DELETE' && !action) {
      const kept = isStaff(user) ? {} : pickFiles(existing?.files ?? {}, true);
      if (existing && Object.keys(kept).length > 0) {
        // Helpline staff discard their own changes; Aselo staff's service configuration stays
        const draft: Draft = {
          ...existing,
          files: kept,
          meta: {
            ...existing.meta,
            revision: existing.meta.revision + 1,
            status: 'editing',
            updatedAt: now,
            updatedBy: user.name,
            baseHashes: pickFiles(existing.meta.baseHashes, true),
          },
        };
        await context.drafts.put(draft);
        return ok({ revision: draft.meta.revision, status: 'editing' });
      }
      if (existing) await context.drafts.remove(code, version);
      return ok({ revision: 0, status: 'editing' });
    }

    if (method === 'POST' && action === '/submit') {
      if (!existing) return fail(404, 'There are no changes to submit.');
      const submitted: Draft = {
        ...existing,
        meta: { ...existing.meta, status: 'submitted', submittedAt: now, submittedBy: user.name },
      };
      await context.drafts.put(submitted);
      await context.notifier.draftSubmitted(submitted, user);
      return ok(submitted.meta);
    }

    if (method === 'POST' && action === '/apply') {
      if (user.role !== 'aselo-staff') return fail(403, 'Only Aselo staff can apply changes.');
      if (!existing) return fail(404, 'There are no changes to apply.');
      const result = await context.applier.apply(existing, user);
      await context.drafts.remove(code, version);
      return ok(result);
    }

    return fail(404, `Unknown API route ${route}`);
  } catch (err) {
    const status = err instanceof DefinitionsApiError ? err.statusCode : 500;
    return fail(status, (err as Error).message);
  }
};
