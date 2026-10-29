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
 * Studio flows sharing one template (FlowDetails.variants), on the test helpline in
 * __fixtures__/helplines/zz: a survey in English and Spanish.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';
import type { Board } from '../src/flows/model';
import { messageFor, withVariantMessage } from '../src/flows/model';
import { boardChecks } from '../src/flows/checks';
import { toFlowExport } from '../src/flows/exports';
import { toStudioFlows } from '../src/flows/studioTemplate';
import { importHelpline } from './flowImport';
import { parseTemplate } from './hcl';
import type { ApiContext, ApiUser } from './api';
import { handleApiRequest } from './api';
import { MemoryDraftStore } from './drafts';
import { MemoryRecordingFiles, MemoryRecordingLogStore } from './recordingStores';

const fixtures = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__/helplines');

describe('flows sharing a template', () => {
  test('one board, a variant per flow, each with its own flow_vars, texts and recordings folder', async () => {
    const { boards, report, recordings } = await importHelpline(fixtures, 'zz');
    expect(boards).toHaveLength(1);
    expect(report.flows).toEqual([expect.objectContaining({ name: 'survey', variants: ['survey_en', 'survey_es'] })]);
    const { content } = boards[0];
    expect(content.flow?.variants).toEqual([
      {
        key: 'survey_en',
        label: 'English',
        recordingsFolder: 'survey_en',
        flowVars: { staging: expect.objectContaining({ assets_url: 'https://zz-recordings-1234.twil.io/en' }) },
      },
      expect.objectContaining({ key: 'survey_es', label: 'Spanish', recordingsFolder: 'survey_es' }),
    ]);
    const thanks = content.objects.find((object) => object.studioName === 'play_message_voice_thanks')!;
    expect(thanks.message).toMatchObject({ script: 'Thank you for your answers.', language: 'en' });
    expect(messageFor(thanks, 'survey_es', 'survey_en')).toMatchObject({
      script: 'Gracias por sus respuestas.',
      language: 'es',
    });
    // Each flow's recordings, into its own folder
    expect(recordings).toEqual([
      expect.objectContaining({
        fileName: 'gather_input_voice_rating.mp3',
        folder: 'survey_en',
        sourceUrl: 'https://zz-recordings-1234.twil.io/en/gather_input_voice_rating.mp3',
      }),
      expect.objectContaining({ fileName: 'gather_input_voice_rating.mp3', folder: 'survey_es' }),
    ]);
    expect(boards[0].recordingFiles.sort()).toEqual([
      'survey_en/gather_input_voice_rating.mp3',
      'survey_es/gather_input_voice_rating.mp3',
    ]);
  });

  test('the template is one: unchanged it comes back as it is; a Spanish text goes in survey_es flow_vars', async () => {
    const { boards } = await importHelpline(fixtures, 'zz');
    const { content } = boards[0];
    const [generated] = toStudioFlows(content);
    const original = parseTemplate(readFileSync(path.join(fixtures, 'zz/templates/studio-flows/survey.tftpl'), 'utf8'));
    expect(parseTemplate(generated.text)).toEqual(original);
    expect(generated.flowVars).toEqual([]);

    const changed = {
      ...content,
      objects: content.objects.map((object) =>
        object.studioName === 'play_message_voice_thanks'
          ? withVariantMessage(object, 'survey_es', 'survey_en', {
              ...messageFor(object, 'survey_es', 'survey_en'),
              script: 'Muchas gracias.',
            })
          : object,
      ),
    };
    const [regenerated] = toStudioFlows(changed);
    // Still the one template, unchanged; the text is the Spanish flow's own
    expect(parseTemplate(regenerated.text)).toEqual(original);
    expect(regenerated.flowVars).toEqual([
      {
        scope: 'flow_vars',
        name: 'thanks_text',
        value: 'Muchas gracias.',
        widget: 'play_message_voice_thanks',
        flow: 'survey_es',
      },
    ]);
    // The English one is untouched
    expect(changed.objects.find((object) => object.studioName === 'play_message_voice_thanks')!.message?.script).toBe(
      'Thank you for your answers.',
    );
  });

  test('a variant without its own script is flagged; the export lists each flow and its recordings folder', async () => {
    const { boards } = await importHelpline(fixtures, 'zz');
    const content = {
      ...boards[0].content,
      objects: boards[0].content.objects.map((object) =>
        object.studioName === 'play_message_voice_thanks' ? { ...object, variantMessages: undefined } : object,
      ),
    };
    expect(boardChecks(content).map((issue) => issue.message)).toContain('Spanish: “Thanks” has no script yet.');
    const board: Board = {
      code: 'zz',
      id: 'b',
      meta: { revision: 1, createdAt: '', createdBy: '', updatedAt: '', updatedBy: '' },
      content,
    };
    const exported = toFlowExport(board, {
      baseUrls: {
        staging: 'https://recordings.test/zz/staging/survey_en',
        production: 'https://recordings.test/zz/production/survey_en',
      },
      recordings: [],
    });
    expect(exported.sharedTemplate).toEqual({
      template: 'zz/templates/studio-flows/survey.tftpl',
      recordingsUrlVariable: 'assets_url',
      flows: [
        expect.objectContaining({
          key: 'survey_en',
          recordingsUrls: {
            staging: 'https://recordings.test/zz/staging/survey_en',
            production: 'https://recordings.test/zz/production/survey_en',
          },
        }),
        expect.objectContaining({
          key: 'survey_es',
          recordingsUrls: {
            staging: 'https://recordings.test/zz/staging/survey_es',
            production: 'https://recordings.test/zz/production/survey_es',
          },
        }),
      ],
    });
  });
});

describe('recordings in a flow’s own folder', () => {
  const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
  const files = new MemoryRecordingFiles();
  const context: ApiContext = {
    formDefinitionsDir: '/nowhere',
    drafts: new MemoryDraftStore(),
    recordings: { files, log: new MemoryRecordingLogStore() },
    notifier: { draftSubmitted: async () => {} },
  };
  const call = (method: string, apiPath: string, body?: unknown) =>
    handleApiRequest(context, { method, path: apiPath, body, user: staff });

  test('the same file name in English and Spanish: two files, two addresses', async () => {
    await call('POST', '/api/recordings/zz/f/survey_en/uploads', { fileName: 'rating.mp3' });
    files.put('zz/survey_en', 'rating.mp3', 'english');
    files.put('zz/survey_es', 'rating.mp3', 'spanish');
    await call('POST', '/api/recordings/zz/f/survey_en/files/rating.mp3/uploaded');
    const english = (await call('GET', '/api/recordings/zz/f/survey_en')).body as {
      baseUrls: { staging: string };
      recordings: { fileName: string; staging?: { url: string; size: number } }[];
    };
    const spanish = (await call('GET', '/api/recordings/zz/f/survey_es')).body as typeof english;
    expect(english.baseUrls.staging).toBe('https://recordings.test/zz/staging/survey_en');
    expect(english.recordings[0].staging).toMatchObject({
      url: 'https://recordings.test/zz/staging/survey_en/rating.mp3',
      size: 'english'.length,
    });
    expect(spanish.recordings[0].staging).toMatchObject({
      url: 'https://recordings.test/zz/staging/survey_es/rating.mp3',
      size: 'spanish'.length,
    });
    // The helpline's own folder doesn't list the flows' folders
    expect(((await call('GET', '/api/recordings/zz')).body as typeof english).recordings).toEqual([]);
    expect([...files.files.keys()].sort()).toEqual([
      'zz/staging/survey_en/rating.mp3',
      'zz/staging/survey_es/rating.mp3',
    ]);
  });
});
