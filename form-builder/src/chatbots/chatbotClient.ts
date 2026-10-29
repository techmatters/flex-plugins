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
 * Talks to the chatbot designer's routes (server/chatbotApi.ts). Tests run the same server code in
 * process through the Send.
 */
import { apiFetch } from '../auth';
import type { Send } from '../draftClient';
import type { ChatbotImport } from '../../server/chatbotImport';
import type { BranchChoice, FromBranch } from '../../server/branches';
import type { DefinitionFiles, HelplineSummary } from '../../server/definitionsApi';
import type { ChatbotDesign, ChatbotMeta, ChatbotsSummary, StoredChatbots } from './model';
import { ContactForms, contactFormsOf } from './formMappings';

export type ChatbotSaveOutcome =
  { ok: true; meta: ChatbotMeta } | { ok: false; conflict: { updatedBy?: string; updatedAt?: string } };

export type ChatbotClient = {
  list(): Promise<ChatbotsSummary[]>;
  // undefined when the helpline has no design yet
  load(code: string): Promise<StoredChatbots | undefined>;
  save(code: string, expectedRevision: number, design: ChatbotDesign): Promise<ChatbotSaveOutcome>;
  // From the default config, or a flex-plugins branch
  previewImport(code: string, branch?: string): Promise<ChatbotImport & FromBranch>;
  branches(): Promise<BranchChoice[]>;
  // The helpline's contact forms (the version given, else its newest), for the fields answers fill in
  contactForms(code: string, version?: string): Promise<ContactForms | undefined>;
};

export const chatbotClientFor = (send: Send): ChatbotClient => {
  const expectOk = async (method: string, path: string, body?: unknown) => {
    const response = await send(method, path, body);
    if (response.status >= 400) throw new Error(response.body?.message ?? `Request failed (${response.status})`);
    return response.body;
  };
  return {
    list: () => expectOk('GET', '/api/chatbots'),
    async load(code) {
      const response = await send('GET', `/api/chatbots/${code}`);
      if (response.status === 404) return undefined;
      if (response.status >= 400) throw new Error(response.body?.message ?? 'Could not load the chatbots design');
      return response.body;
    },
    async save(code, expectedRevision, design) {
      const response = await send('PUT', `/api/chatbots/${code}`, { expectedRevision, design });
      if (response.status === 409) {
        return {
          ok: false,
          conflict: { updatedBy: response.body?.updatedBy, updatedAt: response.body?.updatedAt },
        };
      }
      if (response.status >= 400) throw new Error(response.body?.message ?? 'Could not save the chatbots design');
      return { ok: true, meta: response.body };
    },
    previewImport: (code, branch) => expectOk('POST', `/api/chatbots/${code}/import`, branch ? { branch } : undefined),
    branches: () => expectOk('GET', '/api/branches'),
    async contactForms(code, version) {
      const helplines = (await expectOk('GET', '/api/helplines')) as HelplineSummary[];
      const versions = helplines.find((helpline) => helpline.code === code)?.versions ?? [];
      const chosen = version && versions.includes(version) ? version : versions[versions.length - 1];
      if (!chosen) return undefined;
      const definitions = (await expectOk('GET', `/api/definitions/${code}/${chosen}`)) as DefinitionFiles;
      return contactFormsOf(chosen, definitions.files, definitions.featureFlags);
    },
  };
};

export const httpChatbotClient: ChatbotClient = chatbotClientFor(async (method, path, body) => {
  const response = await apiFetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => undefined) };
});
