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
 * Talks to the flow designer's API routes (server/boardsApi.ts, server/recordingsApi.ts). Tests
 * run the same server code in process through clientFor's Send.
 */
import { apiFetch } from '../auth';
import type { Send } from '../draftClient';
import type { Board, BoardContent, BoardMeta, BoardSummary, Person } from './model';
import type { RecordingsList } from './recordings';
import type { HelplineImport, ImportedRecording } from '../../server/flowImport';
import type { BranchChoice, FromBranch } from '../../server/branches';

export type UploadTarget = { url: string; method: 'PUT'; headers: Record<string, string> };

// Sends a file to where the API said (a signed S3 link when deployed). Not through apiFetch: the
// link carries its own permission, and an extra Authorization header would break it.
export type SendFile = (target: UploadTarget, file: Blob) => Promise<void>;

export const sendFileWithFetch: SendFile = async (target, file) => {
  const response = await fetch(target.url, { method: target.method, headers: target.headers, body: file });
  if (!response.ok) throw new Error(`The upload failed (${response.status}). Please try again.`);
};

export type BoardSaveOutcome =
  { ok: true; meta: BoardMeta } | { ok: false; conflict: { updatedBy?: string; updatedAt?: string } };

export type BoardClient = {
  list(): Promise<BoardSummary[]>;
  create(code: string, title: string, copyFrom?: { code: string; id: string }, content?: BoardContent): Promise<Board>;
  load(code: string, id: string): Promise<Board>;
  save(code: string, id: string, expectedRevision: number, content: BoardContent): Promise<BoardSaveOutcome>;
  remove(code: string, id: string): Promise<void>;
  // Who can be assigned tasks: a helpline's people, or the Aselo team's (code _aselo)
  people(code: string): Promise<Person[]>;
  savePeople(code: string, people: Person[]): Promise<Person[]>;
  // A helpline's recordings (see recordings.ts); each change answers with the updated list
  recordings(code: string): Promise<RecordingsList>;
  uploadRecording(code: string, fileName: string, file: Blob): Promise<RecordingsList>;
  approveRecording(code: string, fileName: string, approved: boolean): Promise<RecordingsList>;
  publishRecording(code: string, fileName: string): Promise<RecordingsList>;
  removeRecording(code: string, fileName: string): Promise<RecordingsList>;
  // Aselo staff: a copy under another name (its standard one: the widget's)
  copyRecording(code: string, fileName: string, to: string): Promise<RecordingsList>;
  // Aselo staff: a board built from a live helpline, and copying its recordings
  // From the default config, or a flex-plugins branch
  previewImport(code: string, branch?: string): Promise<HelplineImport & FromBranch>;
  branches(): Promise<BranchChoice[]>;
  importRecording(code: string, recording: ImportedRecording): Promise<RecordingsList>;
  // The helpline's chatbots (from its chatbots design), for the Chatbot object; none if it has no design
  chatbots(code: string): Promise<ChatbotChoice[]>;
};

// A chatbot a flow can start: its name (botSuffix) and language (en_USCH, the configs folder)
export type ChatbotChoice = { name: string; language: string };

export const boardClientFor = (send: Send, sendFile: SendFile = sendFileWithFetch): BoardClient => {
  const expectOk = async (method: string, path: string, body?: unknown) => {
    const response = await send(method, path, body);
    if (response.status >= 400) {
      throw new Error(response.body?.message ?? `Request failed (${response.status})`);
    }
    return response.body;
  };
  return {
    list: () => expectOk('GET', '/api/boards'),
    create: (code, title, copyFrom, content) => expectOk('POST', `/api/boards/${code}`, { title, copyFrom, content }),
    load: (code, id) => expectOk('GET', `/api/boards/${code}/${id}`),
    async save(code, id, expectedRevision, content) {
      const response = await send('PUT', `/api/boards/${code}/${id}`, { expectedRevision, content });
      if (response.status === 409) {
        return { ok: false, conflict: { updatedBy: response.body?.updatedBy, updatedAt: response.body?.updatedAt } };
      }
      if (response.status >= 400) throw new Error(response.body?.message ?? 'Could not save the board');
      return { ok: true, meta: response.body };
    },
    remove: async (code, id) => {
      await expectOk('DELETE', `/api/boards/${code}/${id}`);
    },
    people: (code) => expectOk('GET', `/api/people/${code}`),
    savePeople: (code, people) => expectOk('PUT', `/api/people/${code}`, { people }),
    recordings: (code) => expectOk('GET', `/api/recordings/${code}`),
    async uploadRecording(code, fileName, file) {
      const target: UploadTarget = await expectOk('POST', `/api/recordings/${code}/uploads`, {
        fileName,
        size: file.size,
      });
      await sendFile(target, file);
      return expectOk('POST', `/api/recordings/${code}/files/${fileName}/uploaded`);
    },
    approveRecording: (code, fileName, approved) =>
      expectOk('POST', `/api/recordings/${code}/files/${fileName}/approve`, { approved }),
    publishRecording: (code, fileName) => expectOk('POST', `/api/recordings/${code}/files/${fileName}/publish`),
    removeRecording: (code, fileName) => expectOk('DELETE', `/api/recordings/${code}/files/${fileName}`),
    copyRecording: (code, fileName, to) => expectOk('POST', `/api/recordings/${code}/files/${fileName}/copy`, { to }),
    previewImport: (code, branch) => expectOk('POST', `/api/flows/import/${code}`, branch ? { branch } : undefined),
    branches: () => expectOk('GET', '/api/branches'),
    importRecording: (code, recording) => expectOk('POST', `/api/recordings/${code}/import`, recording),
    async chatbots(code) {
      const response = await send('GET', `/api/chatbots/${code}`);
      if (response.status >= 400) return [];
      const bots: ChatbotChoice[] = response.body?.design?.bots ?? [];
      return bots.map(({ name, language }) => ({ name, language }));
    },
  };
};

export const httpBoardClient: BoardClient = boardClientFor(async (method, path, body) => {
  const response = await apiFetch(path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => undefined) };
});
