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
 * The chatbot designer's routes, called from api.ts:
 *
 *   GET  /api/chatbots                  the designs this person can open, summarised (ChatbotsSummary[])
 *   GET  /api/chatbots/:code            a helpline's chatbots design (404 if none)
 *   PUT  /api/chatbots/:code            Aselo staff: save ({ expectedRevision, design }); 0 creates it; 409 if someone else saved
 *   POST /api/chatbots/:code/import     Aselo staff: a design read from the live twilio-iac config (not saved)
 *
 * Designs are kept like routing designs (designStore.ts), under chatbots/. Helpline staff see their
 * own helplines' chatbots; for now only Aselo staff change them.
 */
import type { S3Client } from '@aws-sdk/client-s3';
import type { ChatbotDesign, ChatbotsSummary, StoredChatbots } from '../src/chatbots/model';
import { botStatusOf, isNewBot } from '../src/chatbots/status';
import type { ApiResponse, ApiUser } from './api';
import { importChatbots } from './chatbotImport';
import { DesignStore, isValidDesignCode, LocalDesignStore, MemoryDesignStore, S3DesignStore } from './designStore';

export type ChatbotStore = DesignStore<StoredChatbots>;
export class LocalChatbotStore extends LocalDesignStore<StoredChatbots> {}
export class MemoryChatbotStore extends MemoryDesignStore<StoredChatbots> {}
export class S3ChatbotStore extends S3DesignStore<StoredChatbots> {
  constructor(bucket: string, s3?: Pick<S3Client, 'send'>) {
    super(bucket, 'chatbots', s3);
  }
}

// Answer types can carry long lists of ways to say things; this still stops a runaway design
const MAX_DESIGN_BYTES = 4_000_000;

const ok = (body: unknown, status = 200): ApiResponse => ({ status, body });
const fail = (status: number, message: string, extra: object = {}): ApiResponse => ({
  status,
  body: { message, ...extra },
});

const summaryOf = (stored?: StoredChatbots): ChatbotsSummary | undefined =>
  stored && {
    code: stored.code,
    meta: stored.meta,
    bots: stored.design.bots.map((bot) => ({
      id: bot.id,
      name: bot.name,
      language: bot.language,
      questions: bot.intents.reduce((total, intent) => total + intent.questions.length, 0),
      status: botStatusOf(stored.design, bot),
      isNew: isNewBot(stored.design, bot),
      environments: bot.environments,
    })),
  };

const canOpen = (user: ApiUser, code: string) => user.helplines === 'all' || user.helplines.includes(code);

const isDesign = (value: unknown): value is ChatbotDesign => {
  const design = value as ChatbotDesign;
  return (
    typeof design === 'object' &&
    design !== null &&
    typeof design.schemaVersion === 'number' &&
    Array.isArray(design.bots) &&
    typeof design.answerTypes === 'object' &&
    design.answerTypes !== null
  );
};

export const handleChatbotRequest = async (
  store: ChatbotStore | undefined,
  helplinesConfigDir: string | undefined,
  formDefinitionsDir: string | undefined,
  method: string,
  path: string,
  body: unknown,
  user: ApiUser,
  now: string,
): Promise<ApiResponse> => {
  if (!store) return fail(501, "The chatbot designer isn't set up here.");
  if (method === 'GET' && path === '/api/chatbots') {
    const codes = (await store.list()).filter((code) => canOpen(user, code)).sort();
    const summaries = await Promise.all(codes.map(async (code) => summaryOf(await store.get(code))));
    return ok(summaries.filter((summary): summary is ChatbotsSummary => Boolean(summary)));
  }
  const match = path.match(/^\/api\/chatbots\/([^/]+)(\/import)?$/);
  if (!match) return fail(404, `Unknown API route ${method} ${path}`);
  const [, code, importing] = match;
  if (!isValidDesignCode(code)) return fail(400, `Invalid helpline ${code}`);
  if (!canOpen(user, code)) return fail(403, `You don't have access to ${code}.`);

  if (importing) {
    if (method !== 'POST') return fail(404, `Unknown API route ${method} ${path}`);
    if (user.role !== 'aselo-staff') return fail(403, 'Only Aselo staff import chatbots.');
    if (!helplinesConfigDir) return fail(501, "The helplines' config isn't available here.");
    return ok(await importChatbots(helplinesConfigDir, code, formDefinitionsDir));
  }

  const existing = await store.get(code);
  if (method === 'GET') return existing ? ok(existing) : fail(404, 'No chatbots design yet.');

  if (method === 'PUT') {
    // For now helpline staff see their chatbots without changing them
    if (user.role !== 'aselo-staff') return fail(403, 'Only Aselo staff change chatbots for now.');
    const { expectedRevision, design } = (body ?? {}) as { expectedRevision?: unknown; design?: unknown };
    if (typeof expectedRevision !== 'number' || !isDesign(design)) return fail(400, 'Invalid chatbots design');
    if (JSON.stringify(design).length > MAX_DESIGN_BYTES) return fail(413, 'This design is too big to save.');
    const revision = existing?.meta.revision ?? 0;
    if (expectedRevision !== revision) {
      return fail(409, 'This design was changed by someone else.', {
        updatedBy: existing?.meta.updatedBy,
        updatedAt: existing?.meta.updatedAt,
        revision,
      });
    }
    const saved: StoredChatbots = {
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
