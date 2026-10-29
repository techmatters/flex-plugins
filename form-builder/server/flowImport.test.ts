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

import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, test } from 'vitest';
import { boardChecks } from '../src/flows/checks';
import { exitsOf } from '../src/flows/model';
import { HelplineImport, importHelpline, separate } from './flowImport';
import type { Board, BoardContent, BoardSummary } from '../src/flows/model';
import type { RecordingsList } from '../src/flows/recordings';
import { ApiContext, ApiUser, handleApiRequest } from './api';
import { MemoryBoardStore } from './boards';
import { MemoryDraftStore } from './drafts';
import { MemoryRecordingFiles, MemoryRecordingLogStore } from './recordingStores';

const helplinesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../twilio-iac/helplines');

describe('importing a live helpline', () => {
  let usnm: HelplineImport;

  beforeAll(async () => {
    usnm = await importHelpline(helplinesDir, 'usnm');
  });

  // The board of the flow read from this template
  const boardOf = (template: string) =>
    usnm.boards[usnm.report.flows.findIndex((flow) => flow.template === template)].content;
  const find = (content: BoardContent, studioName: string) =>
    content.objects.find((object) => object.studioName === studioName)!;

  test('one board per Studio flow: channels sharing a template, system down, the other Studio flows', () => {
    expect(usnm.report.environments).toEqual(['production', 'staging']);
    expect(usnm.report.flows.map((flow) => flow.template)).toEqual([
      'usnm/templates/studio-flows/voice.tftpl',
      'usnm/templates/studio-flows/sms.tftpl',
      'usnm/templates/studio-flows/sms-redirect.tftpl',
      'templates/studio-flows/system-down.tftpl',
      'usnm/templates/studio-flows/post-call-survey.tftpl',
      'usnm/templates/studio-flows/post-call-survey-es.tftpl',
      'usnm/templates/studio-flows/post-call-survey-en.tftpl',
    ]);
    expect(usnm.report.flows[1].channels).toEqual(expect.arrayContaining(['sms', 'sms_shortcode']));
    // Where each flow is live, and its channels that are in one environment only
    expect(usnm.report.flows.map((flow) => [flow.title, flow.environments])).toContainEqual([
      '[sms_longcode, sms_state_longcode] · sms-redirect',
      ['production'],
    ]);
    expect(usnm.report.flows[0].environments).toEqual(['staging', 'production']);
    expect(usnm.report.flows[1].channelEnvironments).toMatchObject({
      sms: ['staging', 'production'],
      sms_shortcode: ['production'],
      chat: ['staging'],
    });
    expect(usnm.boards.map((board) => board.title)).toContain('USNM · [voice] · voice');
    expect(usnm.boards.map((board) => board.content.frames[0].channel)).toEqual([
      'voice',
      'sms',
      'sms',
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    usnm.boards.forEach(({ content }) => {
      // One frame, holding every object
      expect(content.frames).toHaveLength(1);
      const [frame] = content.frames;
      content.objects.forEach((object) => {
        expect(object.frameId).toBe(frame.id);
        expect(object.x + object.width).toBeLessThanOrEqual(frame.width);
        expect(object.y + object.height).toBeLessThanOrEqual(frame.height);
      });
      // Widget names are only unique within their own flow; two flows can use the same one
      expect(
        boardChecks(content)
          .map((issue) => issue.message)
          .join('\n'),
      ).not.toMatch(/also named/);
    });
  });

  test("Studio's tall vertical gaps are brought closer, without objects overlapping", () => {
    // Objects too close in a column are moved down; side by side ones stay
    const boxes = [
      { x: 0, y: 0, width: 200, height: 70 },
      { x: 0, y: 50, width: 200, height: 70 },
      { x: 300, y: 50, width: 200, height: 70 },
      { x: 100, y: 60, width: 200, height: 70 },
    ];
    separate(boxes);
    expect(boxes.map(({ x, y }) => [x, y])).toEqual([
      [0, 0],
      [0, 94],
      [300, 50],
      [100, 188],
    ]);

    usnm.boards.forEach(({ title, content }) => {
      const overlapping = content.objects.flatMap((a, i) =>
        content.objects
          .slice(i + 1)
          .filter((b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height)
          .map((b) => `${a.studioName ?? a.text} / ${b.studioName ?? b.text}`),
      );
      expect(overlapping, title).toEqual([]);
    });
    // The voice flow spans 4000px or so in Studio; on the board, much less
    // The voice flow is 5,600px tall in Studio; on the board, about half
    expect(boardOf('usnm/templates/studio-flows/voice.tftpl').frames[0].height).toBeLessThan(3200);
  });

  test("each board knows the recordings it plays, so only the chosen boards' are copied", () => {
    expect(usnm.boards[0].recordingFiles).toContain('play_message_voice_outside_us.mp3');
    const smsBoard = usnm.boards[usnm.report.flows.findIndex((flow) => flow.template.endsWith('/sms.tftpl'))];
    expect(smsBoard.recordingFiles).toEqual([]);
  });

  test('widgets become objects of the matching kind, with their Studio name, settings and events', () => {
    const voice = boardOf('usnm/templates/studio-flows/voice.tftpl');
    const sms = boardOf('usnm/templates/studio-flows/sms.tftpl');

    const trigger = voice.objects.find((object) => object.type === 'incoming')!;
    expect(trigger).toMatchObject({ text: 'Incoming voice', exits: ['incomingCall'] });
    const firstStep = voice.connections.find((connection) => connection.from === trigger.id)!;
    expect(voice.objects.find((object) => object.id === firstStep.to)?.studioName).toBe('f_countryVoipFilter');

    expect(find(voice, 'f_isSkilledWorkerAvailable_tya_calls')).toMatchObject({
      type: 'checkQueueAvailability',
      settings: { targetChannel: 'voice', targetSkills: 'TYA,Calls' },
      exits: ['success', 'failed'],
      studio: { type: 'make-http-request', properties: { method: 'POST' } },
    });
    expect(find(voice, 'play_message_voice_outside_us')).toMatchObject({
      type: 'playMessage',
      message: { channel: 'voice' },
      exits: ['audioComplete'],
    });

    // Texts come from the environment's flow_vars
    expect(find(sms, 'send_wait_sms_welcome')).toMatchObject({
      type: 'questionMessaging',
      message: { channel: 'sms', script: expect.stringMatching(/^Welcome to the NAMI HelpLine/) },
    });

    // Every connection leaves by one of its object's ways out
    usnm.boards.forEach(({ content }) => {
      const byId = new Map(content.objects.map((object) => [object.id, object]));
      content.connections.forEach((connection) => {
        expect(exitsOf(byId.get(connection.from)!)).toContain(connection.exit ?? '');
        expect(byId.has(connection.to)).toBe(true);
      });
    });
  });

  test('lists the recordings to copy, per environment, from where they are now', () => {
    expect(usnm.recordings).toContainEqual({
      fileName: 'play_message_voice_outside_us.mp3',
      environment: 'production',
      sourceUrl: 'https://usnm-recordings-5659.twil.io/play_message_voice_outside_us.mp3',
    });
    expect(usnm.recordings).toContainEqual({
      fileName: 'play_message_voice_outside_us.mp3',
      environment: 'staging',
      sourceUrl: 'https://usnm-recordings-v2-1724.twil.io/play_message_voice_outside_us.mp3',
    });
    // A recording not named after its widget is kept, and the object points at it
    const technical = find(
      boardOf('templates/studio-flows/system-down.tftpl'),
      'play_message_recording_technical_issues',
    );
    expect(technical?.message?.recordingFile).toBe('play_message_voice_launch_technical_upgrade.mp3');
    expect(usnm.report.notes).toContainEqual(expect.stringContaining("isn't named after the widget"));
  });

  test("recordings whose address isn't a URL yet: one note per flow and address, with its value", async () => {
    const { report } = await importHelpline(helplinesDir, 'usvc');
    expect(report.notes.filter((note) => note.startsWith('System down:'))).toEqual([
      "System down: 1 recording not copied, as its address isn't a URL yet in staging and production: ${system_down_flow_vars.recording_url} (it's “https://<place_holder>.mp3”). Upload them in the builder once recorded.",
    ]);
  });

  test('every helpline with environment files imports, and its board can be checked', async () => {
    const codes = readdirSync(helplinesDir).filter(
      (code) =>
        /^[a-z0-9]+$/.test(code) &&
        (existsSync(path.join(helplinesDir, code, 'staging.hcl')) ||
          existsSync(path.join(helplinesDir, code, 'production.hcl'))),
    );
    expect(codes.length).toBeGreaterThan(20);
    for (const code of codes) {
      const result = await importHelpline(helplinesDir, code);
      // A frame per Studio flow, or a note saying there are none (e.g. eumc has no channels)
      if (result.boards.length === 0) expect(result.report.notes.join(' '), code).toMatch(/No Studio flows found/);
      result.boards.forEach(({ title, content }) => {
        expect(() => boardChecks(content), title).not.toThrow();
        // Small enough to save (the API takes boards up to 2 MB)
        expect(JSON.stringify(content).length, title).toBeLessThan(2_000_000);
      });
    }
  }, 60_000);
});

describe('the import routes', () => {
  const staffUser: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
  const usnmUser: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };
  let files: MemoryRecordingFiles;
  let context: ApiContext;
  const call = (user: ApiUser, method: string, apiPath: string, body?: unknown) =>
    handleApiRequest(context, { method, path: apiPath, body, user });

  beforeAll(() => {
    files = new MemoryRecordingFiles();
    context = {
      formDefinitionsDir: '/nowhere',
      helplinesConfigDir: helplinesDir,
      drafts: new MemoryDraftStore(),
      boards: new MemoryBoardStore(),
      recordings: {
        files,
        log: new MemoryRecordingLogStore(),
        fetchSource: async (url) => new TextEncoder().encode(`audio from ${url}`),
      },
      notifier: { draftSubmitted: async () => {} },
      now: () => new Date('2026-10-28T12:00:00Z'),
    };
  });

  test('Aselo staff preview an import and create a board from it', async () => {
    expect((await call(usnmUser, 'POST', '/api/flows/import/usnm')).status).toBe(403);
    const preview = await call(staffUser, 'POST', '/api/flows/import/usnm');
    expect(preview.status).toBe(200);
    const [{ title, content }] = (preview.body as HelplineImport).boards;
    const created = await call(staffUser, 'POST', '/api/boards/usnm', { title, content });
    expect(created.status).toBe(201);
    expect((created.body as Board).content.objects.length).toBe(content.objects.length);
    // As it is live: "Imported", and not new
    expect(content.status).toBe('imported');
    expect((created.body as Board).content.status).toBe('imported');
    const [summary] = (await call(staffUser, 'GET', '/api/boards')).body as BoardSummary[];
    expect(summary).toMatchObject({ status: 'imported', isNew: false });
  });

  test('recordings are copied from their live address into the matching folder', async () => {
    const source = 'https://usnm-recordings-5659.twil.io/play_message_voice_outside_us.mp3';
    const fileName = 'play_message_voice_outside_us.mp3';
    for (const environment of ['staging', 'production']) {
      const copied = await call(staffUser, 'POST', '/api/recordings/usnm/import', {
        sourceUrl: source,
        fileName,
        environment,
      });
      expect(copied.status).toBe(200);
    }
    const [recording] = ((await call(staffUser, 'GET', '/api/recordings/usnm')).body as RecordingsList).recordings;
    expect(recording).toMatchObject({
      fileName,
      uploadedBy: 'Aselo person',
      publishedBy: 'Aselo person',
      importedFrom: { staging: source, production: source },
    });
    expect(recording.staging?.etag).toBe(recording.production?.etag);

    // Only from Twilio Serverless or our own addresses, and only by Aselo staff
    for (const sourceUrl of [
      'https://example.com/x.mp3',
      'http://usnm-recordings-5659.twil.io/x.mp3',
      'file:///etc/passwd',
    ]) {
      expect(
        (await call(staffUser, 'POST', '/api/recordings/usnm/import', { sourceUrl, fileName, environment: 'staging' }))
          .status,
      ).toBe(400);
    }
    expect(
      (
        await call(usnmUser, 'POST', '/api/recordings/usnm/import', {
          sourceUrl: source,
          fileName,
          environment: 'staging',
        })
      ).status,
    ).toBe(403);
  });
});
