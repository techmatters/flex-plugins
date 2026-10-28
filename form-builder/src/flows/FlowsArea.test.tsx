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
    // Instead of the signed S3 link: https://upload.test/<code>/staging/<file>
    async (target, file) => {
      const [code, , fileName] = new URL(target.url).pathname.split('/').slice(1);
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
    render(
      <FlowsArea client={clientAs(usnmStaff)} helplineCodes={['usnm']} staffMode={false} userName="NAMI person" />,
    );

    fireEvent.change(await screen.findByPlaceholderText(/USNM contact flows/), { target: { value: 'NAMI flows' } });
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
    expect(saved?.meta.updatedBy).toBe('NAMI person');
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

  test('saving stops and asks to reload when someone else saved the board', async () => {
    const board = await clientAs(staff).create('usnm', 'Shared board');
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    render(
      <FlowsArea client={clientAs(usnmStaff)} helplineCodes={['usnm']} staffMode={false} userName="NAMI person" />,
    );
    await screen.findByRole('heading', { name: 'Shared board' });

    // Someone else saves first
    await clientAs(staff).save('usnm', board.id, 1, { ...board.content, title: 'Renamed elsewhere' });

    fireEvent.click(
      within(screen.getByRole('complementary', { name: 'Objects' })).getByRole('button', { name: /^End/ }),
    );
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Not saved'), { timeout: 4000 });
    expect(screen.getByText(/Aselo person changed this board/)).toBeTruthy();
    expect((await boards.get('usnm', board.id))?.content.title).toBe('Renamed elsewhere');
  });

  const openNewBoard = async (title: string) => {
    const board = await clientAs(staff).create('usnm', title);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    render(
      <FlowsArea client={clientAs(usnmStaff)} helplineCodes={['usnm']} staffMode={false} userName="NAMI person" />,
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
    await openNewBoard('Exports');
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(screen.getByRole('menuitem', { name: 'Recordings and scripts (spreadsheet)' })).toBeTruthy();
    expect(screen.queryByRole('menuitem', { name: 'Flows for Claude (JSON)' })).toBeNull();
    cleanup();

    render(<FlowsArea client={clientAs(staff)} helplineCodes={['usnm']} staffMode userName="Aselo person" />);
    await screen.findByRole('heading', { name: 'Exports' });
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(screen.getByRole('menuitem', { name: 'Flows for Claude (JSON)' })).toBeTruthy();
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

    // Helpline staff upload: it reaches staging
    fireEvent.change(recording().getByLabelText('Upload recording'), {
      target: { files: [new File(['take one'], 'welcome.mp3', { type: 'audio/mpeg' })] },
    });
    await waitFor(() => expect(recording().getByText('Recorded')).toBeTruthy());
    expect(recordingFiles.files.has('usnm/staging/play_message_voice.mp3')).toBe(true);
    expect(recording().getByLabelText('Staging recording')).toBeTruthy();
    // ...but don't approve or publish
    expect(recording().queryByRole('button', { name: 'Approve' })).toBeNull();
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    cleanup();

    // Aselo staff approve, then publish
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

  test('a sticky note becomes a task, listed in the Tasks panel until it is done', async () => {
    await people.put('usnm', [{ name: 'Ale', email: 'ale@example.org' }]);
    await people.put('_aselo', [{ name: 'Aselo person', email: 'aselo@example.org' }]);
    const board = await openNewBoard('Tasks');
    // Opening the board put this person on the helpline's list
    expect((await people.get('usnm')).map((person) => person.name)).toEqual(['Ale', 'NAMI person']);
    fireEvent.click(palette().getByRole('button', { name: /^Sticky note/ }));
    fireEvent.change(settings().getByRole('textbox', { name: 'Note' }), {
      target: { value: 'Record the closed message' },
    });
    fireEvent.click(settings().getByRole('button', { name: 'Make it a task' }));
    const assignee = settings().getByRole('combobox', { name: /^For/ });
    await waitFor(() => expect(within(assignee).getAllByRole('option')).toHaveLength(4));
    expect(within(assignee).getByRole('option', { name: 'Aselo person (aselo@example.org)' })).toBeTruthy();
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
