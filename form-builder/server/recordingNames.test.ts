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
import type { RecordingsList } from '../src/flows/recordings';
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
    // From the recordings bucket, not Twilio Serverless
    expect(playOf(generated)).toBe(`\${flow_vars.recordings_url}/${WIDGET}.mp3`);
    expect(generated.todo.join('\n')).not.toMatch(/Serverless/);
  });

  describe("USCH's voice board, as designed: recordings from the bucket, a new menu said until recorded", () => {
    const BUCKET = {
      staging: 'https://recordings.tl.techmatters.org/usch/staging',
      production: 'https://recordings.tl.techmatters.org/usch/production',
    };
    const RENAMED: Record<string, string> = {
      [WIDGET]: 'play_message_voice_en_childhelp_voice_welcome',
      play_message_childhelp_voice_no_spanish_counselor_prequeue:
        'play_message_voice_es_childhelp_no_spanish_counselor_prequeue',
      play_message_voice_blocked: 'play_message_voice_blocked',
    };
    const MENU = 'gather_input_voice_en_childhelp_service_menu';
    const SCRIPT = 'If this is a life-threatening emergency, hang up and call 911. For Spanish, press 1.';
    const recordingsOf = (files: string[]): RecordingsList => ({
      baseUrls: BUCKET,
      recordings: files.map((fileName) => ({
        fileName,
        staging: { etag: 'e', size: 1, lastModified: 'now', url: `${BUCKET.staging}/${fileName}` },
      })),
    });
    const RECORDED = Object.values(RENAMED).map((name) => `${name}.mp3`);
    // The widgets renamed (their recordings given the new names, as the builder copies them), and a
    // new menu with a script and no recording
    const designed = (): BoardContent => {
      const frameId = welcome.objects.find((object) => object.studioName === WIDGET)!.frameId;
      return {
        ...welcome,
        objects: [
          ...welcome.objects.map((object) => {
            const name = object.studioName && RENAMED[object.studioName];
            if (!name) return object;
            const { recordingFile: _old, ...message } = object.message!;
            return { ...object, studioName: name, message };
          }),
          {
            id: 'menu',
            type: 'menuVoice',
            frameId,
            text: 'Childhelp service menu',
            studioName: MENU,
            message: { channel: 'voice', language: 'en', script: SCRIPT },
            x: 900,
            y: 650,
            width: 220,
            height: 80,
          },
        ],
      };
    };
    const stateOf = (generated: ReturnType<typeof toStudioFlows>[number], name: string) =>
      generated.flow.states.find((state) => state.name === name)!;

    test('the renamed ones play from ${flow_vars.recordings_url}, set for both environments', () => {
      const [generated] = toStudioFlows(designed(), recordingsOf(RECORDED));
      Object.values(RENAMED).forEach((name) =>
        expect(stateOf(generated, name).properties.play).toBe(`\${flow_vars.recordings_url}/${name}.mp3`),
      );
      expect(generated.flowVars.filter((variable) => variable.name === 'recordings_url')).toEqual([
        expect.objectContaining({ value: BUCKET.staging, values: BUCKET, environmentSpecific: true }),
      ]);
      expect(generated.todo.join('\n')).not.toMatch(/Serverless|recordings_url/);
      // Hold music is a Twilio Function: as live
      const [live] = toStudioFlows(welcome);
      generated.flow.states
        .filter((state) => state.type === 'send-to-flex')
        .forEach((state) => expect(state.properties.waitUrl).toBe(stateOf(live, state.name).properties.waitUrl));
      // Recordings nobody changed still play from where they do live
      expect(String(stateOf(generated, 'gather_input_childhelp_voice_spanish_option').properties.play)).toMatch(
        /^\$\{flow_vars\.serverless_usch_functions_url\}\//,
      );
    });

    test('a voice message with a script and no recording says it (from flow_vars) until it is uploaded', () => {
      const [generated] = toStudioFlows(designed(), recordingsOf(RECORDED));
      expect(stateOf(generated, MENU).properties).toMatchObject({
        say: `\${flow_vars.${MENU}}`,
        language: 'en-US',
        gather_language: 'en',
      });
      expect(stateOf(generated, MENU).properties).not.toHaveProperty('play');
      expect(generated.flowVars).toContainEqual(expect.objectContaining({ name: MENU, value: SCRIPT }));
      expect(generated.todo).toContainEqual(expect.stringContaining(`“${MENU}” says its script`));

      // Recorded: it plays the recording
      const [recorded] = toStudioFlows(designed(), recordingsOf([...RECORDED, `${MENU}.mp3`]));
      expect(stateOf(recorded, MENU).properties).toMatchObject({ play: `\${flow_vars.recordings_url}/${MENU}.mp3` });
      expect(stateOf(recorded, MENU).properties).not.toHaveProperty('say');
      expect(recorded.flowVars.map((variable) => variable.name)).not.toContain(MENU);

      // A renamed live one whose recording isn't uploaded yet, with a script: said too (in Spanish)
      const spanish = 'play_message_voice_es_childhelp_no_spanish_counselor_prequeue';
      const scripted = designed();
      scripted.objects = scripted.objects.map((object) =>
        object.studioName === spanish
          ? { ...object, message: { ...object.message, script: 'No hay consejero.' } }
          : object,
      );
      const [said] = toStudioFlows(scripted, recordingsOf(RECORDED.filter((file) => !file.startsWith(spanish))));
      expect(stateOf(said, spanish).properties).toMatchObject({
        say: `\${flow_vars.${spanish}}`,
        language: 'es-MX',
        loop: 1,
      });
      expect(stateOf(said, spanish).properties).not.toHaveProperty('play');
    });
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
