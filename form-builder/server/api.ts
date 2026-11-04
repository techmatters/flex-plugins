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
 *   GET    /api/branches                            Aselo staff: the flex-plugins branches imports can read ({ value, label }[])
 *   GET    /api/definitions/:code/:version          the current (applied) files
 *          (both with ?branch=<branch>, Aselo staff: read from that flex-plugins branch instead)
 *   GET    /api/service-config/:code/post-flow-choices  Aselo staff: queues and post-call survey flows for postStudioFlows
 *   GET    /api/drafts                              drafts this person can see
 *   GET    /api/drafts/:code/:version               a draft (404 if there's none)
 *   PUT    /api/drafts/:code/:version               save a draft
 *   DELETE /api/drafts/:code/:version               discard a draft's changes (?remove=true, Aselo staff: and take it off the list)
 *   POST   /api/drafts/:code/:version/submit        helpline staff: send for review
 *   POST   /api/drafts/:code/:version/apply         Aselo staff only: apply a draft
 *   POST   /api/drafts/:code/:version/approve       approve a form or field for your side (reviews.ts)
 *   POST   /api/drafts/:code/:version/threads       flag a form or field, reply, resolve or delete
 *   POST   /api/drafts/:code/:version/import        Aselo staff: a draft of that version to work on, from master or a branch ({ branch })
 *   ...    /api/boards..., /api/people/...          the flow designer (boardsApi.ts)
 *   ...    /api/recordings/...                      its recordings (recordingsApi.ts)
 *   POST   /api/flows/import/:code                  Aselo staff: a board from a live helpline (flowImport.ts)
 *   ...    /api/routing/...                         the routing designer (routingApi.ts)
 *   ...    /api/chatbots/...                        the chatbot designer (chatbotApi.ts)
 *   ...    /api/help/questions                      questions the help panel couldn't answer (helpQuestions.ts)
 *
 * Roles: Aselo staff can do everything for every helpline. Helpline staff only see their own
 * helplines, can't apply, and never see or change the service configuration
 * (service-configuration/*.json). Deployed, both come from Okta groups.
 */
import { randomUUID } from 'crypto';
import { DefinitionsApiError, listHelplines, loadDefinitionFiles } from './definitionsApi';
import {
  Draft,
  DraftStore,
  isValidDraftFilePath,
  isValidDraftKey,
  DraftMeta,
} from './drafts';
import { applyApproval, applyThreadChange, DraftReview, sideOf } from './reviews';
import type { BoardStore } from './boards';
import type { PeopleStore } from './people';
import { handleBoardRequest } from './boardsApi';
import { handleRecordingRequest, RecordingStores } from './recordingsApi';
import { importHelpline } from './flowImport';
import { handleRoutingRequest } from './routingApi';
import { ChatbotStore, handleChatbotRequest } from './chatbotApi';
import type { BranchSource, ImportSource } from './branches';
import { isValidBranch } from './branches';
import type { RoutingStore } from './routingStore';
import { isServiceConfigPath } from './filePaths';
import { loadPostFlowChoices } from './postStudioFlowChoices';
import { handleHelpRequest, HelpQuestionStore } from './helpQuestions';

export type ApiUser = {
  name: string;
  email?: string;
  role: 'aselo-staff' | 'helpline-staff';
  // Helpline codes this person works on; Aselo staff have all of them
  helplines: string[] | 'all';
};

// What GET /api/me returns: the person, and whether Apply works from the builder here (deployed
// without the GitHub App, Aselo staff download the changes and open the PR themselves)
export type Me = ApiUser & { applyInBuilder: boolean };

export type ApiRequest = {
  method: string;
  path: string;
  body?: unknown;
  // The query string's values, e.g. { branch: 'alejandro-c/as/update_1103' }
  query?: Record<string, string | undefined>;
  user: ApiUser;
};

export type ApiResponse = { status: number; body: unknown };

export type ApplyResult = {
  // Where the changes went: files written locally, or the branch / PR when deployed
  description: string;
  written: string[];
  link?: string;
};

export type ApplyDetails = {
  // What changed, in plain language (the review's change log), for the PR description
  description?: string;
};

export interface DraftApplier {
  apply(draft: Draft, user: ApiUser, details?: ApplyDetails): Promise<ApplyResult>;
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
  // Optional: without one, Apply isn't offered and Aselo staff open the PR by hand
  applier?: DraftApplier;
  notifier: Notifier;
  // The flow designer's boards and people lists; without them, their routes answer 501
  boards?: BoardStore;
  people?: PeopleStore;
  // Recording files, and who uploaded, approved and published them; without them, 501
  recordings?: RecordingStores;
  // Routing designs (TaskRouter), one per helpline; without them, 501
  routing?: RoutingStore;
  // Chatbot designs (Lex), one per helpline; without them, 501
  chatbots?: ChatbotStore;
  // Questions sent from the help panel; without them, 501
  helpQuestions?: HelpQuestionStore;
  // Other flex-plugins branches imports can read ({ branch } in an import's body); without it, only the default
  branches?: BranchSource;
  now?: () => Date;
};

type SaveDraftBody = {
  // The revision the person started from; 0 when there was no draft
  expectedRevision: number;
  files: Record<string, unknown>;
  baseHashes: Record<string, string>;
  // The branch the files were read from, when not the default
  source?: ImportSource;
};

const branchOf = (meta?: Pick<DraftMeta, 'source'>) => meta?.source?.branch ?? '';
// A draft someone is working on: changes, or a version imported
const holdsWork = (draft: Draft) =>
  Object.keys(draft.files).length > 0 || Boolean(draft.meta.source) || Boolean(draft.meta.imported);
const isImportSource = (value: unknown): value is ImportSource =>
  typeof (value as ImportSource)?.branch === 'string' &&
  isValidBranch((value as ImportSource).branch) &&
  typeof (value as ImportSource).sha === 'string';

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

const hasReview = (meta?: DraftMeta) =>
  Boolean(meta && (Object.keys(meta.approvals ?? {}).length > 0 || (meta.threads ?? []).length > 0));

// The review data in a draft's metadata (reviews.ts), to carry over to a new version of it
const reviewOf = ({ approvals, threads, reviewLog }: DraftMeta): DraftReview => ({
  ...(approvals ? { approvals } : {}),
  ...(threads ? { threads } : {}),
  ...(reviewLog ? { reviewLog } : {}),
});
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

export const handleApiRequest = async (context: ApiContext, request: ApiRequest): Promise<ApiResponse> => {
  const { user } = request;
  const now = (context.now ?? (() => new Date()))().toISOString();
  const route = `${request.method.toUpperCase()} ${request.path.replace(/\/+$/, '')}`;

  try {
    if (route === 'GET /api/me') {
      const me: Me = { ...user, applyInBuilder: context.applier !== undefined };
      return ok(me);
    }

    // The forms read from another branch (?branch=): the helplines and versions there, and their files
    const readsForms = route === 'GET /api/helplines' || /^GET \/api\/definitions\/[^/]+\/[^/]+$/.test(route);
    const formsBranch = readsForms ? request.query?.branch : undefined;
    if (formsBranch) {
      if (!isStaff(user)) return fail(403, 'Only Aselo staff read other branches.');
      if (!isValidBranch(formsBranch)) return fail(400, `Invalid branch ${formsBranch}`);
      if (!context.branches) return fail(501, "Other branches can't be read here.");
      let snapshot;
      try {
        snapshot = await context.branches.snapshot(formsBranch);
      } catch (err) {
        return fail(404, `Couldn't read the branch ${formsBranch}: ${(err as Error).message}`);
      }
      const response = await handleApiRequest(
        {
          ...context,
          formDefinitionsDir: snapshot.formDefinitionsDir,
          helplinesConfigDir: snapshot.helplinesConfigDir,
          webchatConfigDir: snapshot.webchatConfigDir,
          branches: undefined,
        },
        { ...request, query: {} },
      );
      return response.status === 200 && route !== 'GET /api/helplines'
        ? { ...response, body: { ...(response.body as object), source: { branch: formsBranch, sha: snapshot.sha } } }
        : response;
    }

    if (route === 'GET /api/helplines') {
      const helplines = await listHelplines(context.formDefinitionsDir);
      return ok(helplines.filter((helpline) => canOpenHelpline(user, helpline.code)));
    }

    if (route === 'GET /api/drafts') {
      const drafts = await context.drafts.list();
      return ok(drafts.filter((draft) => canOpenHelpline(user, draft.code)));
    }

    if (route === 'GET /api/branches') {
      if (!isStaff(user)) return fail(403, 'Only Aselo staff import.');
      if (!context.branches) return ok([{ value: '', label: 'master' }]);
      return ok(await context.branches.choices());
    }

    // Imports read the config the builder reads, or another branch's ({ branch } in the body)
    const isImport =
      request.method.toUpperCase() === 'POST' &&
      (/^POST \/api\/flows\/import\/[a-z0-9]+$/.test(route) ||
        /^POST \/api\/(routing|chatbots)\/[a-z0-9]+\/import$/.test(route));
    const branch = isImport ? (request.body as { branch?: unknown } | undefined)?.branch : undefined;
    if (isImport && typeof branch === 'string' && branch !== '') {
      if (!isStaff(user)) return fail(403, 'Only Aselo staff import.');
      if (!isValidBranch(branch)) return fail(400, `Invalid branch ${branch}`);
      if (!context.branches) return fail(501, "Other branches can't be read here.");
      let snapshot;
      try {
        snapshot = await context.branches.snapshot(branch);
      } catch (err) {
        return fail(404, `Couldn't read the branch ${branch}: ${(err as Error).message}`);
      }
      const response = await handleApiRequest(
        {
          ...context,
          helplinesConfigDir: snapshot.helplinesConfigDir,
          formDefinitionsDir: snapshot.formDefinitionsDir,
          branches: undefined,
        },
        { ...request, body: {} },
      );
      return response.status === 200
        ? { ...response, body: { ...(response.body as object), source: { branch, sha: snapshot.sha } } }
        : response;
    }

    const boardsPath = request.path.replace(/\/+$/, '');
    // A board built from a live helpline's twilio-iac config, for Aselo staff to look at first
    const importMatch = route.match(/^POST \/api\/flows\/import\/([a-z0-9]+)$/);
    if (importMatch) {
      if (!isStaff(user)) return fail(403, 'Only Aselo staff import helplines.');
      if (!context.helplinesConfigDir) return fail(501, "The helplines' config isn't available here.");
      return ok(await importHelpline(context.helplinesConfigDir, importMatch[1]));
    }

    if (boardsPath === '/api/routing' || boardsPath.startsWith('/api/routing/')) {
      return await handleRoutingRequest(
        context.routing,
        context.helplinesConfigDir,
        request.method.toUpperCase(),
        boardsPath,
        request.body,
        user,
        now,
      );
    }

    if (boardsPath === '/api/help/questions') {
      return await handleHelpRequest(
        context.helpQuestions,
        request.method.toUpperCase(),
        request.body,
        user,
        () => (context.now ?? (() => new Date()))(),
      );
    }

    if (boardsPath === '/api/chatbots' || boardsPath.startsWith('/api/chatbots/')) {
      return await handleChatbotRequest(
        context.chatbots,
        context.helplinesConfigDir,
        context.formDefinitionsDir,
        request.method.toUpperCase(),
        boardsPath,
        request.body,
        user,
        now,
      );
    }

    if (boardsPath.startsWith('/api/recordings/')) {
      return await handleRecordingRequest(
        context.recordings,
        request.method.toUpperCase(),
        boardsPath,
        request.body,
        user,
        now,
      );
    }
    if (
      boardsPath === '/api/boards' ||
      boardsPath.startsWith('/api/boards/') ||
      boardsPath.startsWith('/api/people/')
    ) {
      if (!context.boards) return fail(501, "The flow designer isn't set up here.");
      const stores = { boards: context.boards, people: context.people };
      return await handleBoardRequest(stores, request.method.toUpperCase(), boardsPath, request.body, user, now);
    }

    // What postStudioFlows can point at (the service configuration is Aselo staff's)
    const choicesMatch = route.match(/^GET \/api\/service-config\/([a-z0-9]+)\/post-flow-choices$/);
    if (choicesMatch) {
      if (!isStaff(user)) return fail(403, 'Only Aselo staff change the service configuration.');
      return ok(await loadPostFlowChoices(context, choicesMatch[1]));
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

    const draftMatch = route.match(/^(GET|PUT|DELETE|POST) \/api\/drafts\/([^/]+)\/([^/]+)(\/submit|\/apply|\/approve|\/threads|\/import)?$/);
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
      const source = isImportSource(request.body.source) ? request.body.source : undefined;
      if (request.body.source !== undefined && !source) return fail(400, 'Invalid branch');
      if (source && !isStaff(user)) return fail(403, 'Only Aselo staff read other branches.');
      // One draft per helpline version: changes started from one branch can't be mixed with another's
      if (existing && holdsWork(existing) && branchOf(existing.meta) !== (source?.branch ?? '')) {
        return fail(409, `There's already a draft of ${code} ${version} started from ${branchOf(existing.meta) || 'master'}.`, {
          updatedBy: existing.meta.updatedBy,
          updatedAt: existing.meta.updatedAt,
          revision: existing.meta.revision,
          branch: branchOf(existing.meta) || 'master',
        });
      }
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

      // Nothing left that differs from the current files: no draft, unless it holds a review
      // (e.g. a question asked before anything changed)
      if (Object.keys(files).length === 0 && !hasReview(existing?.meta) && !existing?.meta.imported && !existing?.meta.source) {
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
          ...(source ? { source } : {}),
          ...(existing?.meta.imported ? { imported: true } : {}),
          // Kept: an approval only stops counting when what it approved changes (src/formReviews.ts)
          ...(existing ? reviewOf(existing.meta) : {}),
        },
      };
      await context.drafts.put(draft);
      return ok(draftForUser(draft, user).meta);
    }

    if (method === 'DELETE' && !action) {
      const kept = isStaff(user) ? {} : pickFiles(existing?.files ?? {}, true);
      // Aselo staff take an imported version off the list (?remove=true); discarding keeps it there
      const removing = isStaff(user) && request.query?.remove === 'true';
      if (existing && !removing && (Object.keys(kept).length > 0 || existing.meta.imported)) {
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
      // The draft is submitted either way; a failed notification is only logged
      await context.notifier.draftSubmitted(submitted, user).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`[form-builder] Could not notify about ${code}/${version}:`, err);
      });
      return ok(submitted.meta);
    }

    // Reviewing the forms (reviews.ts): approvals for the user's side, and flags with their
    // threads. Not a change to the draft's content, so the revision stays and nobody gets a conflict
    if (method === 'POST' && (action === '/approve' || action === '/threads')) {
      // A review can start before anything changed: it starts the draft
      const base: Draft = existing ?? {
        code,
        version,
        files: {},
        meta: { revision: 0, status: 'editing', updatedAt: now, updatedBy: user.name, baseHashes: {} },
      };
      const actor = { name: user.name, side: sideOf(user), isStaff: isStaff(user) };
      const review = reviewOf(base.meta);
      const outcome =
        action === '/approve'
          ? applyApproval(review, request.body, actor, now)
          : applyThreadChange(review, request.body, actor, now, randomUUID);
      if (!outcome.ok) return fail(outcome.status, outcome.message);
      const reviewed: Draft = { ...base, meta: { ...base.meta, ...outcome.review } };
      await context.drafts.put(reviewed);
      return ok(draftForUser(reviewed, user).meta);
    }

    // A version to work on, from master ('') or a branch: listed for its helpline until discarded
    if (method === 'POST' && action === '/import') {
      if (!isStaff(user)) return fail(403, 'Only Aselo staff import.');
      const branch = (request.body as { branch?: unknown } | undefined)?.branch ?? '';
      if (typeof branch !== 'string' || (branch !== '' && !isValidBranch(branch))) {
        return fail(400, `Invalid branch ${String(branch)}`);
      }
      let snapshot: { sha: string; formDefinitionsDir: string } | undefined;
      if (branch) {
        if (!context.branches) return fail(501, "Other branches can't be read here.");
        try {
          snapshot = await context.branches.snapshot(branch);
        } catch (err) {
          return fail(404, `Couldn't read the branch ${branch}: ${(err as Error).message}`);
        }
      }
      const found = (await listHelplines(snapshot?.formDefinitionsDir ?? context.formDefinitionsDir)).find(
        (helpline) => helpline.code === code,
      );
      if (!found?.versions.includes(version)) return fail(404, `${branch || 'master'} has no ${code}/${version}.`);
      if (existing && branchOf(existing.meta) === branch) {
        if (existing.meta.imported) return ok(existing.meta);
        // Already a draft from master: it's listed from now on
        const listed: Draft = { ...existing, meta: { ...existing.meta, imported: true } };
        await context.drafts.put(listed);
        return ok(listed.meta);
      }
      if (existing && (holdsWork(existing) || hasReview(existing.meta))) {
        return fail(409, `There's already a draft of ${code} ${version} started from ${branchOf(existing.meta) || 'master'}.`, {
          branch: branchOf(existing.meta) || 'master',
        });
      }
      const imported: Draft = {
        code,
        version,
        files: {},
        meta: {
          revision: (existing?.meta.revision ?? 0) + 1,
          status: 'editing',
          updatedAt: now,
          updatedBy: user.name,
          baseHashes: {},
          imported: true,
          ...(snapshot ? { source: { branch, sha: snapshot.sha } } : {}),
        },
      };
      await context.drafts.put(imported);
      return ok(imported.meta);
    }

    if (method === 'POST' && action === '/apply') {
      if (user.role !== 'aselo-staff') return fail(403, 'Only Aselo staff can apply changes.');
      if (!existing) return fail(404, 'There are no changes to apply.');
      if (existing.meta.source) {
        return fail(400, `These changes were made to ${existing.meta.source.branch}: download them and commit them to that branch.`);
      }
      if (!context.applier) {
        return fail(501, "Applying from the builder isn't set up. Download the changes and open a PR instead.");
      }
      const description = (request.body as ApplyDetails | undefined)?.description;
      const result = await context.applier.apply(existing, user, {
        description: typeof description === 'string' ? description : undefined,
      });
      await context.drafts.remove(code, version);
      return ok(result);
    }

    return fail(404, `Unknown API route ${route}`);
  } catch (err) {
    const status = err instanceof DefinitionsApiError ? err.statusCode : 500;
    return fail(status, (err as Error).message);
  }
};
