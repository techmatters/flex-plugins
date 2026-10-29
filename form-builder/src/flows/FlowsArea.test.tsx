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

// @vitest-environment jsdom

import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ApiContext, ApiUser } from '../../server/api';
import { handleApiRequest } from '../../server/api';
import { MemoryBoardStore } from '../../server/boards';
import { MemoryPeopleStore } from '../../server/people';
import { MemoryRecordingFiles, MemoryRecordingLogStore } from '../../server/recordingStores';
import { MemoryDraftStore } from '../../server/drafts';
import { boardClientFor } from './boardClient';
import { FlowsArea } from './FlowsArea';
import { importHelpline } from '../../server/flowImport';

// What React Flow needs from a browser that jsdom doesn't have (see reactflow.dev/learn/advanced-use/testing)
beforeAll(() => {
  class ResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {}

    observe(target: Element) {
      const contentRect = { width: 800, height: 600 } as DOMRectReadOnly;
      this.callback([{ target, contentRect } as ResizeObserverEntry], this as unknown as globalThis.ResizeObserver);
    }

    unobserve() {}

    disconnect() {}
  }
  class DOMMatrixReadOnly {
    m22: number;

    constructor(transform?: string) {
      const scale = transform?.match(/scale\(([1-9.]+)\)/)?.[1];
      this.m22 = scale !== undefined ? Number(scale) : 1;
    }
  }
  vi.stubGlobal('ResizeObserver', ResizeObserver);
  vi.stubGlobal('DOMMatrixReadOnly', DOMMatrixReadOnly);
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return parseFloat(this.style.height) || 600;
      },
    },
    offsetWidth: {
      get() {
        return parseFloat(this.style.width) || 800;
      },
    },
  });
  (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () =>
    ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect;
});

const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };

let boards: MemoryBoardStore;
let people: MemoryPeopleStore;
let recordingFiles: MemoryRecordingFiles;
let context: ApiContext;

const clientAs = (user: ApiUser) =>
  boardClientFor(
    (method, path, body) => handleApiRequest(context, { method, path, body: structuredClone(body), user }),
    // Instead of the signed S3 link: https://upload.test/<code>/staging/[<flow folder>/]<file>
    async (target, file) => {
      const parts = new URL(target.url).pathname.split('/').slice(1);
      const [helpline] = parts;
      const fileName = parts[parts.length - 1];
      const code = parts.length === 4 ? `${helpline}/${parts[2]}` : helpline;
      // jsdom's Blob has no text()
      const content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsText(file);
      });
      recordingFiles.put(code, fileName, content);
    },
  );

beforeEach(() => {
  window.history.replaceState(null, '', '/?area=flows');
  boards = new MemoryBoardStore();
  people = new MemoryPeopleStore();
  recordingFiles = new MemoryRecordingFiles();
  context = {
    formDefinitionsDir: '/nowhere',
    drafts: new MemoryDraftStore(),
    boards,
    people,
    recordings: {
      files: recordingFiles,
      log: new MemoryRecordingLogStore(),
      fetchSource: async (url: string) => new TextEncoder().encode(`audio from ${url}`),
    },
    // The repo's twilio-iac/helplines, for importing a live helpline
    helplinesConfigDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../twilio-iac/helplines'),
    notifier: { draftSubmitted: async () => {} },
  };
});

afterEach(cleanup);

// Autosave waits a second after the last change, so these take a few seconds each
describe('flow designer', { timeout: 20_000 }, () => {
  test('a new board opens, objects are added from the palette, and it saves by itself', async () => {
    render(<FlowsArea client={clientAs(staff)} helplineCodes={['usnm']} staffMode userName="Aselo person" />);

    fireEvent.change(await screen.findByPlaceholderText(/USNM contact flows/), { target: { value: 'NAMI flows' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'For' }), { target: { value: 'usnm' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create board' }));

    await screen.findByRole('heading', { name: 'NAMI flows' });
    expect(window.location.search).toMatch(/board=usnm%2F/);

    const palette = screen.getByRole('complementary', { name: 'Objects' });
    fireEvent.click(within(palette).getByRole('button', { name: /^Frame/ }));
    fireEvent.click(within(palette).getByRole('button', { name: /^Decision/ }));

    // The new decision is selected: its settings show, with the Studio name suggested
    const settings = screen.getByRole('region', { name: 'Settings' });
    expect(within(settings).getByRole('combobox', { name: /^Kind/ })).toHaveProperty('value', 'decision');
    fireEvent.click(within(settings).getByRole('button', { name: /^Use split_decision/ }));

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    const [summary] = await boards.list();
    const saved = await boards.get('usnm', summary.id);
    expect(saved?.meta.updatedBy).toBe('Aselo person');
    expect(saved?.content.frames).toHaveLength(1);
    expect(saved?.content.objects).toMatchObject([
      { type: 'decision', text: 'Decision', studioName: 'split_decision', exits: ['Yes', 'No', 'noMatch'] },
    ]);
    // Added in the middle of the view, which is inside the new frame
    expect(saved?.content.objects[0].frameId).toBe(saved?.content.frames[0].id);
  });

  test('helpline staff see the templates without being able to change them', async () => {
    const template = await clientAs(staff).create('_templates', 'Standard pre-queue flow');
    render(
      <FlowsArea client={clientAs(usnmStaff)} helplineCodes={['usnm']} staffMode={false} userName="NAMI person" />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Standard pre-queue flow' }));
    await screen.findByRole('heading', { name: 'Standard pre-queue flow' });
    expect(screen.getByText('View only')).toBeTruthy();
    expect(screen.queryByRole('complementary', { name: 'Objects' })).toBeNull();
    expect(template.code).toBe('_templates');
  });

  test("helpline staff see their helpline's boards, but don't add or change them", async () => {
    const board = await clientAs(staff).create('usnm', 'NAMI flows');
    render(
      <FlowsArea client={clientAs(usnmStaff)} helplineCodes={['usnm']} staffMode={false} userName="NAMI person" />,
    );

    // The list, without the form to add a board
    const open = await screen.findByRole('button', { name: 'NAMI flows' });
    expect(screen.getByRole('heading', { name: 'Contact flows' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'New board' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Create board' })).toBeNull();
    fireEvent.click(open);

    // The board opens view only: no palette, no undo, nothing saved
    await screen.findByRole('heading', { name: 'NAMI flows' });
    expect(screen.getByText('View only')).toBeTruthy();
    expect(screen.queryByRole('complementary', { name: 'Objects' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect((await boards.get('usnm', board.id))?.meta.revision).toBe(1);
  });

  test('saving stops and asks to reload when someone else saved the board', async () => {
    const board = await clientAs(staff).create('usnm', 'Shared board');
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    render(<FlowsArea client={clientAs(staff)} helplineCodes={['usnm']} staffMode userName="Aselo person" />);
    await screen.findByRole('heading', { name: 'Shared board' });

    // Someone else saves first
    await clientAs({ ...staff, name: 'Other Aselo person' }).save('usnm', board.id, 1, {
      ...board.content,
      title: 'Renamed elsewhere',
    });

    fireEvent.click(
      within(screen.getByRole('complementary', { name: 'Objects' })).getByRole('button', { name: /^End/ }),
    );
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Not saved'), { timeout: 4000 });
    expect(screen.getByText(/Other Aselo person changed this board/)).toBeTruthy();
    expect((await boards.get('usnm', board.id))?.content.title).toBe('Renamed elsewhere');
  });

  const openNewBoard = async (title: string, user = staff) => {
    const board = await clientAs(staff).create('usnm', title);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    render(
      <FlowsArea
        client={clientAs(user)}
        helplineCodes={['usnm']}
        staffMode={user.role === 'aselo-staff'}
        userName={user.name}
      />,
    );
    await screen.findByRole('heading', { name: title });
    return board;
  };
  const palette = () => within(screen.getByRole('complementary', { name: 'Objects' }));
  const settings = () => within(screen.getByRole('region', { name: 'Settings' }));

  test('Studio names that break the standards, or repeat, are pointed out', async () => {
    await openNewBoard('Names');
    fireEvent.click(palette().getByRole('button', { name: /^Decision/ }));
    fireEvent.change(settings().getByRole('textbox', { name: /^Studio name/ }), {
      target: { value: 'splitsAABBwrong' },
    });
    expect(settings().getByText('“Decision”: Decision names start with split_.')).toBeTruthy();
    expect(screen.getByLabelText('Has errors')).toBeTruthy();

    // Two voice messages: the second one's suggested name doesn't repeat the first
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    fireEvent.click(settings().getByRole('button', { name: 'Use play_message_voice' }));
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    expect(settings().getByRole('button', { name: 'Use play_message_voice_2' })).toBeTruthy();
    fireEvent.change(settings().getByRole('textbox', { name: /^Studio name/ }), {
      target: { value: 'play_message_voice' },
    });
    expect(settings().getByText(/another object in this flow is also named play_message_voice./)).toBeTruthy();
  });

  test('the skilled worker checks hold their route settings and are named after the route', async () => {
    const board = await openNewBoard('Skills');
    fireEvent.click(palette().getByRole('button', { name: /^Skilled worker available/ }));
    expect(settings().getByText('“Skilled worker available?” has no Studio name yet.')).toBeTruthy();
    fireEvent.change(settings().getByRole('textbox', { name: /^Skills/ }), { target: { value: 'TYA,Calls' } });
    fireEvent.change(settings().getByRole('combobox', { name: /^Channel/ }), { target: { value: 'voice' } });
    fireEvent.click(settings().getByRole('button', { name: 'Use f_isSkilledWorkerAvailable_tya_calls' }));
    expect(settings().queryByText(/has no Studio name yet/)).toBeNull();

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    expect((await boards.get('usnm', board.id))?.content.objects[0]).toMatchObject({
      type: 'checkQueueAvailability',
      studioName: 'f_isSkilledWorkerAvailable_tya_calls',
      settings: { targetSkills: 'TYA,Calls', targetChannel: 'voice' },
    });
    expect(palette().getByRole('button', { name: /^Skilled worker logged in/ })).toBeTruthy();
  });

  test('the Check panel lists what to fix, and a way out can end the flow on purpose', async () => {
    await openNewBoard('Check');
    fireEvent.click(palette().getByRole('button', { name: /^End/ }));
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    fireEvent.click(settings().getByRole('button', { name: /^Use play_message_voice/ }));

    fireEvent.click(screen.getByRole('tab', { name: /^Check/ }));
    const check = within(screen.getByRole('region', { name: 'Check' }));
    expect(check.getByText('0 errors, 4 warnings')).toBeTruthy();
    expect(check.getByRole('button', { name: 'Nothing comes after “Play message (voice)”.' })).toBeTruthy();

    fireEvent.click(check.getByRole('button', { name: 'The flow ends here on purpose' }));
    expect(check.queryByText(/Nothing comes after/)).toBeNull();
    expect(check.getByText('0 errors, 3 warnings')).toBeTruthy();

    // The warnings can be hidden, leaving only errors
    fireEvent.click(check.getByRole('checkbox', { name: 'Show warnings' }));
    expect(check.queryAllByRole('listitem')).toHaveLength(0);
  });

  test('exports: the spreadsheet for everyone, the JSON for Claude only for Aselo staff', async () => {
    await openNewBoard('Exports', usnmStaff);
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(screen.getByRole('menuitem', { name: 'Recordings and scripts (spreadsheet)' })).toBeTruthy();
    expect(screen.queryByRole('menuitem', { name: 'Flows for Claude (JSON)' })).toBeNull();
    cleanup();

    render(<FlowsArea client={clientAs(staff)} helplineCodes={['usnm']} staffMode userName="Aselo person" />);
    await screen.findByRole('heading', { name: 'Exports' });
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(screen.getByRole('menuitem', { name: 'Flows for Claude (JSON)' })).toBeTruthy();
  });

  test('flows sharing a template: one board, each flow its own script and recordings folder', async () => {
    const { boards: imported } = await importHelpline(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../server/__fixtures__/helplines'),
      'zz',
    );
    const board = await clientAs(staff).create('usnm', 'Survey', undefined, imported[0].content);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    render(<FlowsArea client={clientAs(staff)} helplineCodes={['usnm']} staffMode userName="Aselo person" />);
    await screen.findByRole('heading', { name: 'Survey' });
    expect(screen.getByRole('tab', { name: 'English' }).getAttribute('aria-selected')).toBe('true');

    // Spanish: its own script and recording
    fireEvent.click(screen.getByRole('tab', { name: 'Spanish' }));
    fireEvent.click(screen.getByText('Thanks'));
    const script = () => settings().getByRole('textbox', { name: 'Script' }) as HTMLTextAreaElement;
    expect(script().value).toBe('Gracias por sus respuestas.');
    fireEvent.change(script(), { target: { value: 'Muchas gracias.' } });
    const recording = () => within(screen.getByRole('region', { name: 'Recording' }));
    fireEvent.change(recording().getByLabelText('Upload recording'), {
      target: { files: [new File(['gracias'], 'thanks.mp3', { type: 'audio/mpeg' })] },
    });
    await waitFor(() =>
      expect(recordingFiles.files.get('usnm/staging/survey_es/play_message_voice_thanks.mp3')?.content).toBe('gracias'),
    );
    expect(recordingFiles.files.has('usnm/staging/survey_en/play_message_voice_thanks.mp3')).toBe(false);

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    const thanks = (await boards.get('usnm', board.id))!.content.objects.find(
      (object) => object.studioName === 'play_message_voice_thanks',
    )!;
    expect(thanks.message?.script).toBe('Thank you for your answers.');
    expect(thanks.variantMessages?.survey_es?.script).toBe('Muchas gracias.');

    // Back to English: its own script
    fireEvent.click(screen.getByRole('tab', { name: 'English' }));
    expect(script().value).toBe('Thank you for your answers.');

    // Spanish becomes its own flow: a new board, with its texts and a template of its own to make
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('tab', { name: 'Spanish' }));
    fireEvent.click(screen.getByRole('button', { name: 'Make Spanish its own flow' }));
    await waitFor(() => expect(screen.queryByRole('tab', { name: 'Spanish' })).toBeNull());
    const spanish = (await boards.list()).find((summary) => summary.title === 'Survey (Spanish)')!;
    const { content: split } = (await boards.get('usnm', spanish.id))!;
    expect(split.flow).toMatchObject({
      variants: [expect.objectContaining({ key: 'survey_es', recordingsFolder: 'survey_es' })],
      ownTemplate: { suggested: 'zz/templates/studio-flows/survey-es.tftpl' },
    });
    expect(split.objects.find((object) => object.studioName === 'play_message_voice_thanks')?.message?.script).toBe(
      'Muchas gracias.',
    );
  });

  test('a template other helplines use: said on the board; changing it for all is Aselo staff’s choice', async () => {
    const { boards: imported } = await importHelpline(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../twilio-iac/helplines'),
      'clhs',
    );
    const systemDown = imported.find((candidate) => candidate.title.endsWith('System down'))!;
    const board = await clientAs(staff).create('usnm', 'System down', undefined, systemDown.content);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    render(<FlowsArea client={clientAs(staff)} helplineCodes={['usnm']} staffMode userName="Aselo person" />);
    await screen.findByRole('heading', { name: 'System down' });
    expect(screen.getByText(/Shared template, also used by/)).toBeTruthy();
    expect(screen.getByText(/give USNM a copy of its own/)).toBeTruthy();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Change the shared template for every helpline' }));
    expect(screen.getByText(/every one of these helplines changes too/)).toBeTruthy();
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    expect((await boards.get('usnm', board.id))!.content.flow?.studio?.changeShared).toBe(true);
    cleanup();

    // Helpline staff see where changes go, without the choice
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    render(
      <FlowsArea client={clientAs(usnmStaff)} helplineCodes={['usnm']} staffMode={false} userName="NAMI person" />,
    );
    await screen.findByRole('heading', { name: 'System down' });
    expect(screen.getByText(/every one of these helplines changes too/)).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: 'Change the shared template for every helpline' })).toBeNull();
  });

  test('recordings with older names are given the standard one: copied, and the widgets play it', async () => {
    const { boards: imported } = await importHelpline(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../twilio-iac/helplines'),
      'usch',
    );
    const widget = 'play_message_childhelp_voice_welcome';
    const { content } = imported.find(({ content: candidate }) =>
      candidate.objects.some((object) => object.studioName === widget),
    )!;
    const old = content.objects.find((object) => object.studioName === widget)!.message!.recordingFile!;
    recordingFiles.put('usnm', old, 'welcome audio');
    const board = await clientAs(staff).create('usnm', 'Voice', undefined, content);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    render(<FlowsArea client={clientAs(staff)} helplineCodes={['usnm']} staffMode userName="Aselo person" />);
    await screen.findByRole('heading', { name: 'Voice' });
    fireEvent.click(screen.getByRole('tab', { name: 'Recordings' }));
    const panel = within(screen.getByRole('region', { name: 'Recordings' }));
    fireEvent.click(await panel.findByRole('button', { name: /^Use the standard names/ }));

    await waitFor(() => expect(recordingFiles.files.get(`usnm/staging/${widget}.mp3`)?.content).toBe('welcome audio'));
    // The old file is kept: live flows still play it until the template changes
    expect(recordingFiles.files.has(`usnm/staging/${old}`)).toBe(true);
    await waitFor(() => expect(panel.queryByRole('button', { name: /^Use the standard names/ })).toBeNull());
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    const saved = (await boards.get('usnm', board.id))!.content.objects.filter(
      (object) => object.message?.recordingFile,
    );
    expect(saved).toEqual([]);
  });

  test('a voice message is recorded, approved and published', async () => {
    const board = await openNewBoard('Recordings');
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    fireEvent.change(settings().getByRole('combobox', { name: /^Channel/ }), { target: { value: 'voice' } });
    fireEvent.change(settings().getByRole('textbox', { name: 'Script' }), {
      target: { value: 'Welcome to the helpline.' },
    });
    fireEvent.click(settings().getByRole('button', { name: /^Use play_message_voice/ }));
    const recording = () => within(screen.getByRole('region', { name: 'Recording' }));
    await waitFor(() => expect(recording().getByText('Script ready')).toBeTruthy());

    // Aselo staff upload: it reaches staging
    fireEvent.change(recording().getByLabelText('Upload recording'), {
      target: { files: [new File(['take one'], 'welcome.mp3', { type: 'audio/mpeg' })] },
    });
    await waitFor(() => expect(recording().getByText('Recorded')).toBeTruthy());
    expect(recordingFiles.files.has('usnm/staging/play_message_voice.mp3')).toBe(true);
    expect(recording().getByLabelText('Staging recording')).toBeTruthy();
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    cleanup();

    // Then approve and publish it
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    render(<FlowsArea client={clientAs(staff)} helplineCodes={['usnm']} staffMode userName="Aselo person" />);
    await screen.findByRole('heading', { name: 'Recordings' });
    fireEvent.click(screen.getByRole('tab', { name: 'Recordings' }));
    const panel = within(screen.getByRole('region', { name: 'Recordings' }));
    await waitFor(() => expect(panel.getByText('Recorded')).toBeTruthy());
    fireEvent.click(panel.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(panel.getByText('Approved')).toBeTruthy());
    fireEvent.click(panel.getByRole('button', { name: 'Publish to production' }));
    await waitFor(() => expect(panel.getByText('Published')).toBeTruthy());
    expect(recordingFiles.files.get('usnm/production/play_message_voice.mp3')?.content).toBe('take one');
  });

  test('Aselo staff import the flows they choose from a live helpline, a board each, with their recordings', async () => {
    render(<FlowsArea client={clientAs(staff)} helplineCodes={['usnm']} staffMode userName="Aselo person" />);
    fireEvent.change(await screen.findByRole('combobox', { name: 'Helpline to import' }), {
      target: { value: 'usnm' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    const preview = within(await screen.findByRole('region', { name: 'Import preview' }));
    expect(preview.getByRole('checkbox', { name: /^\[voice\] · voice\b/ })).toBeTruthy();
    // Where each flow is live
    const redirect = preview.getByRole('checkbox', { name: /sms-redirect/ }).closest('li')!;
    expect(within(redirect as HTMLElement).queryByText('Staging')).toBeNull();
    expect(within(redirect as HTMLElement).getByText('Production')).toBeTruthy();
    expect(preview.getByText('sms_shortcode: production only · chat: staging only')).toBeTruthy();
    expect(preview.getByText(/recordings to copy: \d+ for staging, \d+ for production/)).toBeTruthy();

    expect(preview.getByRole('button', { name: 'Create the 7 boards' })).toBeTruthy();

    // Only the voice flow
    fireEvent.click(preview.getByRole('button', { name: 'None' }));
    fireEvent.click(preview.getByRole('checkbox', { name: /^\[voice\] · voice\b/ }));
    expect(preview.getByText('66 recordings to copy: 33 for staging, 33 for production.')).toBeTruthy();
    fireEvent.click(preview.getByRole('button', { name: 'Create the board' }));
    await waitFor(() => expect(preview.getByRole('status').textContent).toMatch(/^Copied \d+ of \d+ recordings\.$/), {
      timeout: 15_000,
    });
    const [copied, total] = preview.getByRole('status').textContent!.match(/\d+/g)!;
    expect(copied).toBe(total);
    expect(recordingFiles.files.get('usnm/production/play_message_voice_outside_us.mp3')?.content).toBe(
      'audio from https://usnm-recordings-5659.twil.io/play_message_voice_outside_us.mp3',
    );

    expect((await boards.list()).map((summary) => summary.title)).toEqual(['USNM · [voice] · voice']);
    // ...and only its recordings
    expect(recordingFiles.files.has('usnm/production/play_message_voice_launch_technical_upgrade.mp3')).toBe(false);
    fireEvent.click(preview.getByRole('button', { name: 'USNM · [voice] · voice' }));
    await screen.findByRole('heading', { name: 'USNM · [voice] · voice' });
  });

  test('the start page lists the boards with their status, filtered by status', async () => {
    const aselo = clientAs(staff);
    const draft = await aselo.create('usnm', 'Being designed');
    const ready = await aselo.create('usnm', 'Agreed');
    await aselo.save('usnm', ready.id, 1, { ...ready.content, status: 'ready' });
    const imported = await aselo.create('usnm', 'USNM · voice', undefined, {
      ...ready.content,
      frames: [
        {
          id: 'f-1',
          title: 'voice',
          x: 0,
          y: 0,
          width: 600,
          height: 400,
          studio: { template: 'usnm/templates/studio-flows/voice.tftpl', channels: ['voice'], settings: {} },
        },
      ],
      status: 'imported',
    });
    await aselo.create('_templates', 'Standard pre-queue flow');
    render(
      <FlowsArea client={clientAs(usnmStaff)} helplineCodes={['usnm']} staffMode={false} userName="NAMI person" />,
    );

    const table = within(await screen.findByRole('region', { name: 'Boards' }));
    const rowOf = (title: string) => within(table.getByRole('button', { name: title }).closest('tr')!);
    expect(rowOf(draft.content.title).getByText('In progress')).toBeTruthy();
    expect(rowOf(draft.content.title).getByText('New')).toBeTruthy();
    expect(rowOf('Agreed').getByText('Ready for Claude')).toBeTruthy();
    expect(rowOf(imported.content.title).getByText('Imported')).toBeTruthy();
    expect(rowOf(imported.content.title).queryByText('New')).toBeNull();
    expect(rowOf('Agreed').getByText('USNM')).toBeTruthy();
    // Helpline staff don't delete; the templates are listed apart
    expect(table.queryByRole('button', { name: /^Delete/ })).toBeNull();
    expect(table.queryByRole('button', { name: 'Standard pre-queue flow' })).toBeNull();
    expect(
      within(screen.getByRole('region', { name: 'Aselo templates' })).getByRole('button', {
        name: 'Standard pre-queue flow',
      }),
    ).toBeTruthy();

    // Filtered by status, with counts
    expect(table.getByRole('button', { name: 'All (3)' })).toBeTruthy();
    fireEvent.click(table.getByRole('button', { name: 'Ready for Claude (1)' }));
    expect(table.getByRole('button', { name: 'Agreed' })).toBeTruthy();
    expect(table.queryByRole('button', { name: 'Being designed' })).toBeNull();
    fireEvent.click(table.getByRole('button', { name: 'Implemented (0)' }));
    expect(table.getByText('No boards with this status.')).toBeTruthy();
  });

  test('Aselo staff set the status; a change to the design sets it back to In progress, a comment does not', async () => {
    const board = await openNewBoard('Status');
    const status = () => screen.getByRole('combobox', { name: 'Board status' }) as HTMLSelectElement;
    expect(status().value).toBe('in-progress');
    expect(screen.getByText('New')).toBeTruthy();

    fireEvent.click(palette().getByRole('button', { name: /^Decision/ }));
    fireEvent.change(status(), { target: { value: 'ready' } });
    // Commenting on the (selected) decision doesn't change the design
    fireEvent.change(settings().getByRole('textbox', { name: 'New comment' }), { target: { value: 'Looks good' } });
    fireEvent.click(settings().getByRole('button', { name: 'Comment' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    expect(status().value).toBe('ready');
    let saved = await boards.get('usnm', board.id);
    expect(saved?.content.status).toBe('ready');
    expect(saved?.content.objects[0].thread?.comments).toHaveLength(1);

    // Adding an object does
    fireEvent.click(palette().getByRole('button', { name: /^End/ }));
    await waitFor(() => expect(status().value).toBe('in-progress'));
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    saved = await boards.get('usnm', board.id);
    expect(saved?.content.status).toBe('in-progress');
  });

  test('helpline staff see the status without changing it', async () => {
    const aselo = clientAs(staff);
    const board = await aselo.create('usnm', 'Agreed');
    await aselo.save('usnm', board.id, 1, { ...board.content, status: 'ready' });
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    render(
      <FlowsArea client={clientAs(usnmStaff)} helplineCodes={['usnm']} staffMode={false} userName="NAMI person" />,
    );
    await screen.findByRole('heading', { name: 'Agreed' });
    expect(screen.getByText('Ready for Claude')).toBeTruthy();
    expect(screen.queryByRole('combobox', { name: 'Board status' })).toBeNull();
  });

  test('a sticky note becomes a task, listed in the Tasks panel until it is done', async () => {
    await people.put('usnm', [{ name: 'Ale', email: 'ale@example.org' }]);
    await people.put('_aselo', [{ name: 'Aselo lead', email: 'aselo@example.org' }]);
    const board = await openNewBoard('Tasks');
    // Opening the board put this Aselo person on the Aselo team's list, not the helpline's
    expect((await people.get('_aselo')).map((person) => person.name)).toEqual(['Aselo lead', 'Aselo person']);
    expect((await people.get('usnm')).map((person) => person.name)).toEqual(['Ale']);
    fireEvent.click(palette().getByRole('button', { name: /^Sticky note/ }));
    fireEvent.change(settings().getByRole('textbox', { name: 'Note' }), {
      target: { value: 'Record the closed message' },
    });
    fireEvent.click(settings().getByRole('button', { name: 'Make it a task' }));
    const assignee = settings().getByRole('combobox', { name: /^For/ });
    await waitFor(() => expect(within(assignee).getAllByRole('option')).toHaveLength(4));
    expect(within(assignee).getByRole('option', { name: 'Aselo lead (aselo@example.org)' })).toBeTruthy();
    fireEvent.change(assignee, { target: { value: 'ale@example.org' } });

    fireEvent.click(screen.getByRole('tab', { name: 'Tasks (1)' }));
    const tasks = within(screen.getByRole('region', { name: 'Tasks' }));
    expect(tasks.getByRole('button', { name: 'Record the closed message' })).toBeTruthy();
    expect(tasks.getByText('To do · for Ale')).toBeTruthy();

    fireEvent.click(tasks.getByRole('button', { name: 'Mark as done' }));
    expect(screen.getByRole('tab', { name: 'Tasks' })).toBeTruthy();
    expect(tasks.getByText(/No open tasks/)).toBeTruthy();
    fireEvent.click(tasks.getByRole('button', { name: 'All' }));
    expect(tasks.getByText('Done · for Ale')).toBeTruthy();

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    expect((await boards.get('usnm', board.id))?.content.stickies[0].task).toEqual({
      status: 'done',
      assignee: 'Ale',
      assigneeEmail: 'ale@example.org',
    });
  });
});
