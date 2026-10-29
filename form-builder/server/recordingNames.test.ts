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
 * Recordings with older names (not the widget's, the standard): found at import, flagged, renamed
 * (copied) in the library, and the Studio template then plays the new name. USCH's live config has
 * several (play_message_childhelp_voice_welcome plays childhelp_voice_welcome_message.mp3).
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, test } from 'vitest';
import type { BoardContent } from '../src/flows/model';
import { boardChecks } from '../src/flows/checks';
import { hasNonStandardRecording, standardRecordingName } from '../src/flows/recordings';
import { toStudioFlows } from '../src/flows/studioTemplate';
import type { HelplineImport } from './flowImport';
import { importHelpline } from './flowImport';
import type { ApiContext, ApiUser } from './api';
import { handleApiRequest } from './api';
import { MemoryDraftStore } from './drafts';
import { MemoryRecordingFiles, MemoryRecordingLogStore } from './recordingStores';

const helplinesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../twilio-iac/helplines');
const WIDGET = 'play_message_childhelp_voice_welcome';
const OLD = 'childhelp_voice_welcome_message.mp3';

let usch: HelplineImport;
let welcome: BoardContent;
beforeAll(async () => {
  usch = await importHelpline(helplinesDir, 'usch');
  welcome = usch.boards.find(({ content }) => content.objects.some((object) => object.studioName === WIDGET))!.content;
});

describe('recordings with older names', () => {
  test('the import keeps the name it plays, says who plays it, and the check flags it', () => {
    const object = welcome.objects.find((candidate) => candidate.studioName === WIDGET)!;
    expect(object.message?.recordingFile).toBe(OLD);
    expect(hasNonStandardRecording(object)).toBe(true);
    expect(standardRecordingName(WIDGET, OLD)).toBe(`${WIDGET}.mp3`);
    expect(usch.recordings.find((recording) => recording.fileName === OLD)?.widgets).toEqual([WIDGET]);
    expect(boardChecks(welcome).map((issue) => issue.message)).toContain(
      `“${object.text}” plays ${OLD}, not a file named after it (${WIDGET}).`,
    );
  });

  test('given its standard name on the board, the widget plays that file; otherwise it is as live', () => {
    const [unchanged] = toStudioFlows(welcome);
    const playOf = (generated: typeof unchanged) =>
      String(generated.flow.states.find((state) => state.name === WIDGET)?.properties.play);
    expect(playOf(unchanged)).toMatch(new RegExp(`/${OLD}$`));

    const renamed = {
      ...welcome,
      objects: welcome.objects.map((object) => {
        if (object.studioName !== WIDGET) return object;
        const { recordingFile, ...message } = object.message!;
        return { ...object, message };
      }),
    };
    const [generated] = toStudioFlows(renamed);
    expect(playOf(generated)).toBe(playOf(unchanged).replace(OLD, `${WIDGET}.mp3`));
    expect(generated.todo.some((item) => item.includes(`plays ${WIDGET}.mp3 now (was ${OLD})`))).toBe(true);
  });

  test('renaming in the library is a copy, in each environment the file is in, keeping who did what', async () => {
    const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
    const uschStaff: ApiUser = { name: 'Childhelp person', role: 'helpline-staff', helplines: ['usch'] };
    const files = new MemoryRecordingFiles();
    const context: ApiContext = {
      formDefinitionsDir: '/nowhere',
      drafts: new MemoryDraftStore(),
      recordings: { files, log: new MemoryRecordingLogStore() },
      notifier: { draftSubmitted: async () => {} },
    };
    const call = (user: ApiUser, method: string, apiPath: string, body?: unknown) =>
      handleApiRequest(context, { method, path: apiPath, body, user });
    files.put('usch', OLD, 'welcome audio');
    await call(staff, 'POST', `/api/recordings/usch/files/${OLD}/uploaded`);

    expect(
      (await call(uschStaff, 'POST', `/api/recordings/usch/files/${OLD}/copy`, { to: `${WIDGET}.mp3` })).status,
    ).toBe(403);
    const copied = await call(staff, 'POST', `/api/recordings/usch/files/${OLD}/copy`, { to: `${WIDGET}.mp3` });
    expect(copied.status).toBe(200);
    const list = copied.body as { recordings: { fileName: string; renamedFrom?: string; uploadedBy?: string }[] };
    expect(list.recordings.map((recording) => recording.fileName)).toEqual([OLD, `${WIDGET}.mp3`]);
    expect(list.recordings[1]).toMatchObject({ renamedFrom: OLD, uploadedBy: 'Aselo person' });
    expect(files.files.get(`usch/staging/${WIDGET}.mp3`)?.content).toBe('welcome audio');
    // Nothing in production to copy there
    expect(files.files.has(`usch/production/${WIDGET}.mp3`)).toBe(false);
    expect((await call(staff, 'POST', `/api/recordings/usch/files/missing.mp3/copy`, { to: 'x.mp3' })).status).toBe(
      404,
    );
  });
});
