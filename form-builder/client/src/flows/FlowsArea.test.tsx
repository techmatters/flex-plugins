/** @jest-environment ./jest/jsdomEnvironment.cjs */
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
/* eslint-disable max-classes-per-file -- stand-ins for what jsdom lacks */

import path from 'path';
import { fileURLToPath } from 'url';

import { afterEach, beforeAll, beforeEach, describe, expect, test, jest } from '@jest/globals';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { type ApiContext, type ApiUser, handleApiRequest } from '@tech-matters/form-builder-server/api';
import { BoardStore, newMemoryBoardStore } from '@tech-matters/form-builder-server/boards';
import { newMemoryPeopleStore, PeopleStore } from '@tech-matters/form-builder-server/people';
import {
  newMemoryRecordingFiles,
  MemoryRecordingFiles,
  newMemoryRecordingLogStore,
} from '@tech-matters/form-builder-server/recordingStores';
import { newMemoryDraftStore } from '@tech-matters/form-builder-server/drafts';
import { newMemoryRoutingStore } from '@tech-matters/form-builder-server/routingStore';
import { emptyRouting } from '@tech-matters/form-builder-shared/routing/model';
import { importHelpline } from '@tech-matters/form-builder-server/flowImport';
import { emptyBoard, type FlowObject } from '@tech-matters/form-builder-shared/flows/model';

import { FlowsArea } from './FlowsArea';
import { boardClientFor, NO_HELPLINE_CHOICES } from './boardClient';
import { createAppStore } from '../app/store';
import { sessionLoaded } from '../app/sessionSlice';
import { switchArea } from '../app/appSlice';

// What React Flow needs from a browser that jsdom doesn't have (see reactflow.dev/learn/advanced-use/testing)
beforeAll(() => {
  class ResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {}

    observe(target: Element) {
      const contentRect = { width: 800, height: 600 } as DOMRectReadOnly;
      this.callback([{ target, contentRect } as ResizeObserverEntry], this as unknown as globalThis.ResizeObserver);
    }

    unobserve() {
      // jsdom has no layout to observe
    }

    disconnect() {
      // jsdom has no layout to observe
    }
  }
  class DOMMatrixReadOnly {
    m22: number;

    constructor(transform?: string) {
      const scale = transform?.match(/scale\(([1-9.]+)\)/)?.[1];
      this.m22 = scale === undefined ? 1 : Number(scale);
    }
  }
  Object.assign(globalThis, { ResizeObserver });
  Object.assign(globalThis, { DOMMatrixReadOnly });
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
    ({ x: 0, y: 0, width: 0, height: 0 } as DOMRect);
});

const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };

let boards: BoardStore;
let people: PeopleStore;
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
      const content = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsText(file);
      });
      recordingFiles.put(code, fileName, content);
    },
  );

beforeEach(() => {
  window.history.replaceState(null, '', '/?area=flows');
  boards = newMemoryBoardStore();
  people = newMemoryPeopleStore();
  recordingFiles = newMemoryRecordingFiles();
  context = {
    formDefinitionsDir: '/nowhere',
    drafts: newMemoryDraftStore(),
    boards,
    people,
    routing: newMemoryRoutingStore(),
    recordings: {
      files: recordingFiles,
      log: newMemoryRecordingLogStore(),
      fetchSource: async (url: string) => new TextEncoder().encode(`audio from ${url}`),
    },
    // The repo's twilio-iac/helplines, for importing a live helpline
    helplinesConfigDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../twilio-iac/helplines'),
    notifier: { draftSubmitted: async () => undefined },
  };
});

afterEach(cleanup);

// The area as the app shows it: in a store with the user signed in (Aselo staff, or a helpline's) and
// the board client talking to the API in process
const renderArea = (user: ApiUser, client = clientAs(user), saveRetryDelaysMs?: number[]) => {
  const store = createAppStore({ boardClient: client, ...(saveRetryDelaysMs && { saveRetryDelaysMs }) });
  store.dispatch(
    sessionLoaded({ user: { ...user, applyInBuilder: false }, helplines: [{ code: 'usnm', versions: [] }] }),
  );
  return {
    store,
    ...render(
      <Provider store={store}>
        <FlowsArea />
      </Provider>,
    ),
  };
};

// Autosave waits a second after the last change, so these take a few seconds each
describe('flow designer', () => {
  test('a new board opens, objects are added from the palette, and it saves by itself', async () => {
    renderArea(staff);

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
    // Each way out says how it's compared: a list of values matches any of them
    const [yes, , noMatch] = within(settings).getAllByRole('textbox', { name: 'Way out' });
    // noMatch is Studio's: kept, as named
    expect(noMatch).toHaveProperty('disabled', true);
    expect(within(settings).getAllByRole('button', { name: 'Remove way out' })).toHaveLength(2);
    fireEvent.change(yes, { target: { value: 'Yes,yes,ok' } });
    expect(within(settings).getByRole('combobox', { name: 'Comparison for Yes,yes,ok' })).toHaveProperty(
      'value',
      'matches_any_of',
    );
    fireEvent.change(within(settings).getByRole('combobox', { name: 'Comparison for No' }), {
      target: { value: 'starts_with' },
    });

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    const [summary] = await boards.list();
    const saved = await boards.get('usnm', summary.id);
    expect(saved?.meta.updatedBy).toBe('Aselo person');
    expect(saved?.content.frames).toHaveLength(1);
    expect(saved?.content.objects).toMatchObject([
      {
        type: 'decision',
        text: 'Decision',
        studioName: 'split_decision',
        exits: ['Yes,yes,ok', 'No', 'noMatch'],
        exitOperators: { No: 'starts_with' },
      },
    ]);
    // Added in the middle of the view, which is inside the new frame
    expect(saved?.content.objects[0].frameId).toBe(saved?.content.frames[0].id);
  });

  test('helpline staff see the templates without being able to change them', async () => {
    const template = await clientAs(staff).create('_templates', 'Standard pre-queue flow');
    renderArea(usnmStaff);

    fireEvent.click(await screen.findByRole('button', { name: 'Standard pre-queue flow' }));
    await screen.findByRole('heading', { name: 'Standard pre-queue flow' });
    expect(screen.getByText('View only')).toBeTruthy();
    expect(screen.queryByRole('complementary', { name: 'Objects' })).toBeNull();
    expect(template.code).toBe('_templates');
  });

  test("helpline staff see their helpline's boards, but don't add or change them", async () => {
    const board = await clientAs(staff).create('usnm', 'NAMI flows');
    renderArea(usnmStaff);

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
    renderArea(staff);
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

  // A new board opens as a sketch; these tests work with every detail (Build)
  const openNewBoard = async (title: string, user = staff, mode: 'Sketch' | 'Build' = 'Build') => {
    const board = await clientAs(staff).create('usnm', title);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    renderArea(user);
    await screen.findByRole('heading', { name: title });
    fireEvent.click(within(screen.getByRole('tablist', { name: 'Mode' })).getByRole('tab', { name: new RegExp(mode) }));
    return board;
  };

  test('a new board opens as a sketch: kinds, names and ways out only; Build shows every detail', async () => {
    await openNewBoard('Sketched', staff, 'Sketch');
    expect(
      within(screen.getByRole('tablist', { name: 'Mode' }))
        .getByRole('tab', { name: /Sketch/ })
        .getAttribute('aria-selected'),
    ).toBe('true');
    expect(screen.queryByRole('tab', { name: 'Recordings' })).toBeNull();
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    expect(settings().queryByRole('textbox', { name: 'Script' })).toBeNull();
    expect(settings().queryByRole('region', { name: 'Recording' })).toBeNull();
    expect(settings().getByRole('heading', { name: 'Where it goes' })).toBeTruthy();
    // A Repeat keeps how many times it repeats
    fireEvent.click(palette().getByRole('button', { name: /^Repeat/ }));
    expect(settings().getByRole('textbox', { name: /^Times to repeat/ })).toBeTruthy();

    fireEvent.click(within(screen.getByRole('tablist', { name: 'Mode' })).getByRole('tab', { name: /Build/ }));
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    expect(settings().getByRole('textbox', { name: 'Script' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Recordings' })).toBeTruthy();
  });
  const palette = () => within(screen.getByRole('complementary', { name: 'Objects' }));
  const settings = () => within(screen.getByRole('region', { name: 'Settings' }));

  test('Studio names that break the standards, or repeat, are pointed out', async () => {
    await openNewBoard('Naming');
    // The kind's start is fixed: only the rest is typed, in lower case with underscores
    fireEvent.click(palette().getByRole('button', { name: /^Decision/ }));
    expect(settings().getByTitle('Set by the kind of widget').textContent).toBe('split_');
    fireEvent.change(settings().getByRole('textbox', { name: 'What it is' }), { target: { value: 'Contact Routing' } });
    expect(settings().getByText('split_contact_routing')).toBeTruthy();
    fireEvent.change(settings().getByRole('textbox', { name: 'What it is' }), { target: { value: 'routing_' } });
    expect(settings().getByText('“Decision”: No double or trailing underscores.')).toBeTruthy();
    expect(screen.getByLabelText('Has errors')).toBeTruthy();

    // Functions and requests choose theirs; routes' are the route's name, then a suffix
    fireEvent.click(palette().getByRole('button', { name: /^Other function/ }));
    fireEvent.change(settings().getByRole('combobox', { name: "Name's start" }), { target: { value: 'http_post_' } });
    fireEvent.change(settings().getByRole('textbox', { name: 'What it is' }), { target: { value: 'save survey' } });
    expect(settings().getByText('http_post_save_survey')).toBeTruthy();
    fireEvent.click(palette().getByRole('button', { name: /^Skilled worker logged in/ }));
    expect(settings().getByTitle('Set by the kind of widget').textContent).toBe('f_isSkilledWorkerLoggedIn_');

    // Two voice messages: the second one's suggested name doesn't repeat the first
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    fireEvent.click(settings().getByRole('button', { name: 'Use play_message_voice' }));
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    expect(settings().getByRole('button', { name: 'Use play_message_voice_2' })).toBeTruthy();
    // Its channel (voice) is filled in: with nothing else, it's play_message_voice too
    fireEvent.change(settings().getByRole('textbox', { name: 'What it is' }), { target: { value: 'x' } });
    fireEvent.change(settings().getByRole('textbox', { name: 'What it is' }), { target: { value: '' } });
    expect(settings().getByText(/another object in this flow is also named play_message_voice./)).toBeTruthy();
  });

  test("queues, workflows and skills come from the helpline's routing design, read again when the board is shown again", async () => {
    const saveRouting = (revision: number, skills: string[]) =>
      handleApiRequest(context, {
        method: 'PUT',
        path: '/api/routing/usnm',
        user: staff,
        body: {
          expectedRevision: revision,
          design: {
            ...emptyRouting('usnm'),
            skills: skills.map(name => ({ name })),
            queues: [{ key: 'en_std', name: 'English', workers: { kind: 'nobody' } }],
            workflows: [{ key: 'master', name: 'Master', rules: [] }],
          },
        },
      });
    expect((await saveRouting(0, ['Spanish', 'TYA'])).status).toBeLessThan(300);
    const board = await clientAs(staff).create('usnm', 'Choices');
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    const client = clientAs(staff);
    const { store, container } = renderArea(staff, client);
    await screen.findByRole('heading', { name: 'Choices' });
    fireEvent.click(within(screen.getByRole('tablist', { name: 'Mode' })).getByRole('tab', { name: /Build/ }));

    // Skills are added to the list
    fireEvent.click(palette().getByRole('button', { name: /^Skilled worker available/ }));
    fireEvent.click(await settings().findByRole('button', { name: '+ Spanish' }));
    fireEvent.click(settings().getByRole('button', { name: '+ TYA' }));
    expect((settings().getByRole('textbox', { name: /^Skills/ }) as HTMLInputElement).value).toBe('Spanish,TYA');
    expect(settings().queryByRole('button', { name: '+ Spanish' })).toBeNull();

    // Send to queue: the queues and workflows offered, and chosen ones written in the widget
    fireEvent.click(palette().getByRole('button', { name: /^Send to queue/ }));
    expect([...container.querySelectorAll('datalist option')].map(option => option.getAttribute('value'))).toEqual(
      expect.arrayContaining(['en_std', 'master']),
    );

    // A skill added in Routing meanwhile: offered once the board is shown again
    expect((await saveRouting(1, ['Spanish', 'TYA', 'French'])).status).toBeLessThan(300);
    act(() => {
      store.dispatch(switchArea('forms'));
    });
    act(() => {
      store.dispatch(switchArea('flows'));
    });
    fireEvent.click(palette().getByRole('button', { name: /^Skilled worker logged in/ }));
    expect(await settings().findByRole('button', { name: '+ French' })).toBeTruthy();
  });

  // A Check operating hours step's request body, as saved
  const savedHoursBody = async (id: string) => {
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    const saved = await boards.get('usnm', id);
    const step = saved?.content.objects.find(candidate => candidate.type === 'checkOperatingHours');
    return JSON.parse(step?.settings?.body ?? '{}');
  };

  test("Check operating hours: the channel and office come from the helpline's operating hours, written in its body", async () => {
    // The repo's operating hours files (USNM's: sms and voice, and a preClosing office)
    context.formDefinitionsDir = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../../lambdas/packages/hrm-form-definitions/form-definitions',
    );
    const board = await clientAs(staff).create('usnm', 'Hours');
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    const { store } = renderArea(staff);
    await screen.findByRole('heading', { name: 'Hours' });
    fireEvent.click(within(screen.getByRole('tablist', { name: 'Mode' })).getByRole('tab', { name: /Build/ }));
    await waitFor(() => expect(store.getState().board?.helplineChoices.operatingHours.channels).toHaveLength(2));
    fireEvent.click(palette().getByRole('button', { name: /^Check operating hours/ }));

    const channel = () => settings().getByRole('combobox', { name: /^Channel/ }) as HTMLSelectElement;
    const office = () => settings().getByRole('combobox', { name: /^Office/ }) as HTMLSelectElement;
    const body = () => settings().getByRole('textbox', { name: /^Request body/ }) as HTMLTextAreaElement;
    const optionsOf = (select: HTMLSelectElement) => [...select.options].map(option => option.textContent);
    // Two channels: none chosen yet (an empty body sends the flow's), and the main schedule
    expect(optionsOf(channel())).toEqual(['Not set', 'sms', 'voice', 'Other…']);
    expect(channel().value).toBe('');
    expect(optionsOf(office())).toEqual(['Main schedule (no office)', 'preClosing']);
    expect(office().value).toBe('');
    expect(body().value).toBe('');

    // Chosen: the body starts from what an empty one sends
    fireEvent.change(channel(), { target: { value: 'sms' } });
    expect(JSON.parse(body().value)).toEqual({
      channel: 'sms',
      includeMessageTextInResponse: 'true',
      language: 'en-US',
      from: '{{trigger.conversation.From}}',
    });

    // Its other keys are kept when the channel and office change
    fireEvent.change(body(), { target: { value: '{"language": "es-US", "channel": "sms", "extra": "kept"}' } });
    fireEvent.change(office(), { target: { value: 'preClosing' } });
    fireEvent.change(channel(), { target: { value: 'voice' } });
    expect(JSON.parse(body().value)).toEqual({
      channel: 'voice',
      language: 'es-US',
      extra: 'kept',
      office: 'preClosing',
    });
    expect(await savedHoursBody(board.id)).toEqual(JSON.parse(body().value));

    // Another channel, typed: the check says the helpline's operating hours don't have it
    fireEvent.change(channel(), { target: { value: '__other' } });
    fireEvent.change(settings().getByRole('textbox', { name: 'Channel (other)' }), { target: { value: 'whatsapp' } });
    expect(JSON.parse(body().value)).toMatchObject({ channel: 'whatsapp', office: 'preClosing', extra: 'kept' });
    expect(within(screen.getByRole('list', { name: 'Problems' })).getByText(/“whatsapp” channel/)).toBeTruthy();
    // Back to the main schedule: no office in the body
    fireEvent.change(office(), { target: { value: '' } });
    expect(JSON.parse(body().value)).not.toHaveProperty('office');
  });

  test('Check operating hours: the one channel is chosen for a new step; no operating hours, the JSON only', async () => {
    const withHours = (operatingHours: typeof NO_HELPLINE_CHOICES.operatingHours) => ({
      ...clientAs(staff),
      helplineChoices: async () => ({ ...NO_HELPLINE_CHOICES, operatingHours }),
    });
    const board = await clientAs(staff).create('usnm', 'One channel');
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    const { store } = renderArea(
      staff,
      withHours({ hasOperatingHours: true, channels: ['voice'], offices: ['preClosing'] }),
    );
    await screen.findByRole('heading', { name: 'One channel' });
    fireEvent.click(within(screen.getByRole('tablist', { name: 'Mode' })).getByRole('tab', { name: /Build/ }));
    await waitFor(() => expect(store.getState().board?.helplineChoices.operatingHours.channels).toEqual(['voice']));
    fireEvent.click(palette().getByRole('button', { name: /^Check operating hours/ }));
    expect(settings().getByRole('combobox', { name: /^Channel/ })).toHaveProperty('value', 'voice');
    // An office changes what it answers: the main schedule unless chosen
    expect(settings().getByRole('combobox', { name: /^Office/ })).toHaveProperty('value', '');
    expect(await savedHoursBody(board.id)).toEqual({
      channel: 'voice',
      includeMessageTextInResponse: 'true',
      language: 'en-US',
      from: '{{trigger.conversation.From}}',
    });
    cleanup();

    // No operating hours file: said, and only the JSON
    const other = await clientAs(staff).create('usnm', 'No hours');
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${other.id}`);
    const { store: noHours } = renderArea(staff, withHours({ hasOperatingHours: false, channels: [], offices: [] }));
    await screen.findByRole('heading', { name: 'No hours' });
    fireEvent.click(within(screen.getByRole('tablist', { name: 'Mode' })).getByRole('tab', { name: /Build/ }));
    await waitFor(() => expect(noHours.getState().board?.helplineChoices.chatbots).toEqual([]));
    fireEvent.click(palette().getByRole('button', { name: /^Check operating hours/ }));
    expect(settings().getByText(/no operating hours file, so the check always answers “open”/)).toBeTruthy();
    expect(settings().queryByRole('combobox', { name: /^Channel/ })).toBeNull();
    expect(settings().getByRole('textbox', { name: /^Request body/ })).toBeTruthy();
  });

  test("messages are named by parts: the prefix is set, the flow's channels, languages and services are chosen", async () => {
    const board = await openNewBoard('Parts');
    fireEvent.click(palette().getByRole('button', { name: /^Menu \/ question/ }));
    expect(settings().getByTitle('Set by the kind of widget').textContent).toBe('gather_input_');
    fireEvent.change(settings().getByRole('textbox', { name: 'What it is' }), { target: { value: 'service_menu' } });
    expect(settings().getByText('gather_input_voice_service_menu')).toBeTruthy();
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    cleanup();

    // Opened again, nothing selected: the board's names (channels and two languages chosen from a list,
    // one typed, a service)
    renderArea(staff);
    await screen.findByRole('heading', { name: 'Parts' });
    fireEvent.change(settings().getByRole('combobox', { name: 'Add channels' }), { target: { value: 'voice' } });
    const addLanguage = () => settings().getByRole('combobox', { name: 'Add languages' });
    fireEvent.change(addLanguage(), { target: { value: 'en' } });
    fireEvent.change(addLanguage(), { target: { value: 'es' } });
    expect(settings().getByRole('button', { name: 'Remove Spanish (es)' })).toBeTruthy();
    // Several languages: one flow named per language, unless chosen otherwise
    expect(
      (settings().getByRole('radio', { name: /^One flow, with messages in each language/ }) as HTMLInputElement)
        .checked,
    ).toBe(true);
    const services = settings().getByRole('textbox', { name: /^Services/ });
    fireEvent.change(services, { target: { value: 'Childhelp' } });
    fireEvent.blur(services);

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    expect((await boards.get('usnm', board.id))?.content.flow?.naming).toEqual({
      channels: ['voice'],
      languages: ['en', 'es'],
      services: ['childhelp'],
    });

    // One flow per language sharing the board: a flow each, named after the board, the first its own;
    // widgets' names lose their language, and a flow's key can be changed
    fireEvent.click(settings().getByRole('radio', { name: /^One flow per language/ }));
    expect(screen.getByRole('tablist', { name: 'Flows sharing this template' })).toBeTruthy();
    const spanishKey = settings().getByRole('textbox', { name: 'Spanish studio_flows key' });
    fireEvent.change(spanishKey, { target: { value: 'parts_spanish' } });
    fireEvent.blur(spanishKey);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    expect((await boards.get('usnm', board.id))?.content.flow?.variants).toEqual([
      { key: 'parts_en', label: 'English', recordingsFolder: 'parts_en', added: true },
      { key: 'parts_spanish', label: 'Spanish', recordingsFolder: 'parts_spanish', added: true },
    ]);
  });

  test("the language chosen in a message's name is the message's language", async () => {
    const board = await openNewBoard('Languages');
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    cleanup();
    renderArea(staff);
    await screen.findByRole('heading', { name: 'Languages' });
    fireEvent.change(settings().getByRole('combobox', { name: 'Add channels' }), { target: { value: 'voice' } });
    const addLanguage = () => settings().getByRole('combobox', { name: 'Add languages' });
    fireEvent.change(addLanguage(), { target: { value: 'en' } });
    fireEvent.change(addLanguage(), { target: { value: 'es' } });

    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    fireEvent.change(settings().getByRole('textbox', { name: 'What it is' }), { target: { value: 'welcome' } });
    fireEvent.change(settings().getByRole('textbox', { name: 'Script' }), { target: { value: 'Bienvenido' } });
    const language = () => settings().getByRole('combobox', { name: "Name's language" });
    fireEvent.change(language(), { target: { value: 'en' } });
    // Changed in the name (as after copying an English message), the message follows: no warning
    fireEvent.change(language(), { target: { value: 'es' } });
    expect(settings().getByText('play_message_voice_es_welcome')).toBeTruthy();
    expect(settings().queryByText(/but its Studio name doesn't say so/)).toBeNull();

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    expect((await boards.get('usnm', board.id))?.content.objects[0]).toMatchObject({
      studioName: 'play_message_voice_es_welcome',
      message: { language: 'es' },
    });
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
    // A play message is voice: it has no recording yet; and the board doesn't say its channels,
    // languages or services (warnings that can be ignored)
    expect(check.getByText('0 errors, 8 warnings')).toBeTruthy();
    expect(check.getByText(/^The board doesn't say its services/)).toBeTruthy();
    expect(check.getByRole('button', { name: 'Nothing comes after “Play message (voice)”.' })).toBeTruthy();

    fireEvent.click(check.getByRole('button', { name: 'The flow ends here on purpose' }));
    expect(check.queryByText(/Nothing comes after/)).toBeNull();
    expect(check.getByText('0 errors, 7 warnings')).toBeTruthy();

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

    renderArea(staff);
    await screen.findByRole('heading', { name: 'Exports' });
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(screen.getByRole('menuitem', { name: 'Flows for Claude (JSON)' })).toBeTruthy();
  });

  test('flows sharing a template: one board, each flow its own script and recordings folder', async () => {
    const { boards: imported } = await importHelpline(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '__fixtures__/helplines'),
      'zz',
    );
    const board = await clientAs(staff).create('usnm', 'Survey', undefined, imported[0].content);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    renderArea(staff);
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
    // Replaced: the same file, and the player asks for the new version, not the one the browser kept
    const player = () => recording().getByLabelText('Staging recording') as HTMLAudioElement;
    const before = (await waitFor(() => player())).getAttribute('src');
    fireEvent.change(recording().getByLabelText('Replace recording'), {
      target: { files: [new File(['otra'], 'thanks.wav', { type: 'audio/wav' })] },
    });
    expect(recording().getByText(/plays play_message_voice_thanks.mp3: upload the new recording as MP3/)).toBeTruthy();
    fireEvent.change(recording().getByLabelText('Replace recording'), {
      target: { files: [new File(['muchas gracias'], 'nuevo.mp3', { type: 'audio/mpeg' })] },
    });
    await waitFor(() =>
      expect(recordingFiles.files.get('usnm/staging/survey_es/play_message_voice_thanks.mp3')?.content).toBe(
        'muchas gracias',
      ),
    );
    await waitFor(() => expect(player().getAttribute('src')).not.toBe(before));
    expect(player().getAttribute('src')).toMatch(/play_message_voice_thanks\.mp3\?v=/);

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    const thanks = (await boards.get('usnm', board.id))!.content.objects.find(
      object => object.studioName === 'play_message_voice_thanks',
    )!;
    expect(thanks.message?.script).toBe('Thank you for your answers.');
    expect(thanks.variantMessages?.survey_es?.script).toBe('Muchas gracias.');

    // Another language: a new flow on the same template, its scripts empty and its own recordings folder
    fireEvent.change(screen.getByRole('combobox', { name: 'Add a language' }), { target: { value: 'fr-CA' } });
    expect(screen.getByRole('tab', { name: 'French (Canada)' }).getAttribute('aria-selected')).toBe('true');
    expect(script().value).toBe('');
    expect(
      [...(screen.getByRole('combobox', { name: 'Add a language' }) as HTMLSelectElement).options].map(o => o.value),
    ).not.toContain('fr-FR');
    await waitFor(
      async () =>
        expect((await boards.get('usnm', board.id))!.content.flow?.variants?.[2]).toMatchObject({
          key: 'survey_fr',
          label: 'French (Canada)',
          recordingsFolder: 'survey_fr',
          added: true,
        }),
      { timeout: 4000 },
    );

    // Back to English: its own script
    fireEvent.click(screen.getByRole('tab', { name: 'English' }));
    expect(script().value).toBe('Thank you for your answers.');

    // Spanish becomes its own flow: a new board, with its texts and a template of its own to make
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('tab', { name: 'Spanish' }));
    fireEvent.click(screen.getByRole('button', { name: 'Make Spanish its own flow' }));
    await waitFor(() => expect(screen.queryByRole('tab', { name: 'Spanish' })).toBeNull());
    const spanish = (await boards.list()).find(summary => summary.title === 'Survey (Spanish)')!;
    const { content: split } = (await boards.get('usnm', spanish.id))!;
    expect(split.flow).toMatchObject({
      variants: [expect.objectContaining({ key: 'survey_es', recordingsFolder: 'survey_es' })],
      ownTemplate: { suggested: 'zz/templates/studio-flows/survey-es.tftpl' },
    });
    expect(split.objects.find(object => object.studioName === 'play_message_voice_thanks')?.message?.script).toBe(
      'Muchas gracias.',
    );
  });

  test('a template other helplines use: said on the board; changing it for all is Aselo staff’s choice', async () => {
    const { boards: imported } = await importHelpline(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../twilio-iac/helplines'),
      'clhs',
    );
    const systemDown = imported.find(candidate => candidate.title.endsWith('System down'))!;
    const board = await clientAs(staff).create('usnm', 'System down', undefined, systemDown.content);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    renderArea(staff);
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
    renderArea(usnmStaff);
    await screen.findByRole('heading', { name: 'System down' });
    expect(screen.getByText(/every one of these helplines changes too/)).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: 'Change the shared template for every helpline' })).toBeNull();
  });

  test('recordings with older names are given the standard one: copied, and the widgets play it', async () => {
    const { boards: imported } = await importHelpline(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../twilio-iac/helplines'),
      'usch',
    );
    const widget = 'play_message_childhelp_voice_welcome';
    const { content } = imported.find(({ content: candidate }) =>
      candidate.objects.some(object => object.studioName === widget),
    )!;
    const old = content.objects.find(object => object.studioName === widget)!.message!.recordingFile!;
    recordingFiles.put('usnm', old, 'welcome audio');
    const board = await clientAs(staff).create('usnm', 'Voice', undefined, content);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    renderArea(staff);
    await screen.findByRole('heading', { name: 'Voice' });
    fireEvent.click(screen.getByRole('tab', { name: 'Recordings' }));
    const panel = within(screen.getByRole('region', { name: 'Recordings' }));
    fireEvent.click(await panel.findByRole('button', { name: /^Use the standard names/ }));

    await waitFor(() => expect(recordingFiles.files.get(`usnm/staging/${widget}.mp3`)?.content).toBe('welcome audio'));
    // The old file is kept: live flows still play it until the template changes
    expect(recordingFiles.files.has(`usnm/staging/${old}`)).toBe(true);
    await waitFor(() => expect(panel.queryByRole('button', { name: /^Use the standard names/ })).toBeNull());
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    const saved = (await boards.get('usnm', board.id))!.content.objects.filter(object => object.message?.recordingFile);
    expect(saved).toEqual([]);
  });

  test('a voice message is recorded, approved and published', async () => {
    const board = await openNewBoard('Recordings');
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
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
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    renderArea(staff);
    await screen.findByRole('heading', { name: 'Recordings' });
    fireEvent.click(screen.getByRole('tab', { name: 'Recordings' }));
    const panel = within(screen.getByRole('region', { name: 'Recordings' }));
    await waitFor(() => expect(panel.getByText('Recorded')).toBeTruthy());
    fireEvent.click(panel.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(panel.getByText('Approved')).toBeTruthy());
    // A green check on the object
    expect(document.querySelector('.flow-approved-badge')?.getAttribute('aria-label')).toBe('Approved');
    fireEvent.click(panel.getByRole('button', { name: 'Publish to production' }));
    await waitFor(() => expect(panel.getByText('Published')).toBeTruthy());
    expect(document.querySelector('.flow-approved-badge')?.getAttribute('aria-label')).toBe('Published');
    expect(recordingFiles.files.get('usnm/production/play_message_voice.mp3')?.content).toBe('take one');
  });

  test('Aselo staff import the flows they choose from a live helpline, a board each, with their recordings', async () => {
    renderArea(staff);
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

    expect((await boards.list()).map(summary => summary.title)).toEqual(['USNM · [voice] · voice']);
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
    renderArea(usnmStaff);

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
    renderArea(usnmStaff);
    await screen.findByRole('heading', { name: 'Agreed' });
    expect(screen.getByText('Ready for Claude')).toBeTruthy();
    expect(screen.queryByRole('combobox', { name: 'Board status' })).toBeNull();
  });

  test('a sticky note becomes a task, listed in the Tasks panel until it is done', async () => {
    await people.put('usnm', [{ name: 'Ale', email: 'ale@example.org' }]);
    await people.put('_aselo', [{ name: 'Aselo lead', email: 'aselo@example.org' }]);
    const board = await openNewBoard('Tasks');
    // Opening the board adds nobody: the lists are filled by hand
    expect((await people.get('_aselo')).map(person => person.name)).toEqual(['Aselo lead']);
    expect((await people.get('usnm')).map(person => person.name)).toEqual(['Ale']);
    fireEvent.click(palette().getByRole('button', { name: /^Sticky note/ }));
    fireEvent.change(settings().getByRole('textbox', { name: 'Note' }), {
      target: { value: 'Record the closed message' },
    });
    fireEvent.click(settings().getByRole('button', { name: 'Make it a task' }));
    const assignee = settings().getByRole('combobox', { name: /^For/ });
    // Only the helpline's people: the Aselo team isn't offered until added to the helpline's list
    await waitFor(() => expect(within(assignee).getAllByRole('option')).toHaveLength(2));
    expect(within(assignee).queryByRole('option', { name: /Aselo lead/ })).toBeNull();
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

describe('people lists', () => {
  test('Aselo staff are added to a helpline from the Aselo team, and only then offered on its boards', async () => {
    await people.put('usnm', [{ name: 'Ale', email: 'ale@example.org' }]);
    await people.put('_aselo', [
      { name: 'Aselo lead', email: 'aselo@example.org' },
      { name: 'Other staff', email: 'other@example.org' },
    ]);
    renderArea(staff);
    fireEvent.change(await screen.findByRole('combobox', { name: 'List' }), { target: { value: 'usnm' } });
    const addFromTeam = await screen.findByRole('combobox', { name: 'Add from the Aselo team' });
    fireEvent.change(addFromTeam, { target: { value: 'aselo@example.org' } });
    await waitFor(() =>
      expect(within(screen.getByRole('list', { name: 'People' })).getByText('Aselo lead')).toBeTruthy(),
    );
    expect((await people.get('usnm')).map(person => person.name)).toEqual(['Ale', 'Aselo lead']);
    // Whoever is already on the list isn't offered again
    expect(
      within(screen.getByRole('combobox', { name: 'Add from the Aselo team' }))
        .getAllByRole('option')
        .map(option => option.textContent),
    ).toEqual(['Choose someone…', 'Other staff']);
  });
});

describe('testing a flow (Test mode)', () => {
  test('a run asks for the reply, follows the split on it, and a finished path is saved as tested', async () => {
    const object = (id: string, type: FlowObject['type'], extra: Partial<FlowObject> = {}): FlowObject => ({
      id,
      type,
      frameId: 'f',
      text: id,
      x: 100,
      y: 100,
      width: 200,
      height: 70,
      ...extra,
    });
    const board = await clientAs(staff).create('usnm', 'Language menu', undefined, {
      ...emptyBoard('Language menu'),
      frames: [{ id: 'f', title: 'SMS', x: 0, y: 0, width: 900, height: 600, channel: 'sms' }],
      objects: [
        object('Start', 'incoming'),
        object('Language', 'questionMessaging', { studioName: 'send_wait_sms_language' }),
        object('Which', 'decision', { studioName: 'split_language', exits: ['1', 'noMatch'] }),
        object('English', 'sendMessage', { studioName: 'send_message_sms_en_welcome' }),
      ],
      connections: [
        { id: 'c1', from: 'Start', to: 'Language' },
        { id: 'c2', from: 'Language', to: 'Which', exit: 'reply' },
        { id: 'c3', from: 'Which', to: 'English', exit: '1' },
        { id: 'c4', from: 'Which', to: 'Language', exit: 'noMatch' },
      ],
    });
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    renderArea(staff);
    await screen.findByRole('heading', { name: 'Language menu' });

    // Test mode: the board can't be changed, the Test panel is open
    fireEvent.click(within(screen.getByRole('tablist', { name: 'Mode' })).getByRole('tab', { name: /Test/ }));
    expect(screen.queryByRole('complementary', { name: 'Objects' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Play/ }));

    // "2" isn't an answer: the split (paused on, to check it) goes back to the question; "1" is
    const steps = () => within(screen.getByRole('list', { name: 'Steps' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Their reply' }), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(screen.getByText(/inbound.Body}} = “2”/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Next: noMatch/ }));
    expect(steps().getAllByText('Language')).toHaveLength(2);
    fireEvent.change(screen.getByRole('textbox', { name: 'Their reply' }), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    fireEvent.click(screen.getByRole('button', { name: /^Next: 1/ }));
    // Paused on the message, to check it, then the end
    expect(steps().getByText('English')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }));
    expect(screen.getByText(/The flow ends after English/)).toBeTruthy();
    // Back one step: paused on the message again; on to the end again
    fireEvent.click(screen.getByRole('button', { name: 'Back one step' }));
    expect(screen.queryByText(/The flow ends after English/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }));
    expect(screen.getByText(/The flow ends after English/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Mark path as tested' }));
    expect(screen.getByText(/4 of 4 ways out tested, in 1 path/)).toBeTruthy();
    await waitFor(() => expect(screen.getByText('All changes saved')).toBeTruthy(), { timeout: 4000 });
    const saved = await boards.get('usnm', board.id);
    expect(saved?.content.testedPaths).toHaveLength(1);
    expect(saved?.content.testedPaths?.[0].steps.map(step => step.exit)).toEqual([
      '',
      'reply',
      'noMatch',
      'reply',
      '1',
      '',
    ]);
    // Testing doesn't make the design "in progress" again
    expect(saved?.content.status).toBe(board.content.status);
  });
});

describe('a board save that fails', () => {
  // Saves fail (as when the server can't be reached) while `remaining` is above 0
  const openFailing = async (failingSaves: { remaining: number }) => {
    const board = await clientAs(staff).create('usnm', 'Unreliable');
    window.history.replaceState(null, '', `/?area=flows&board=usnm/${board.id}`);
    const client = clientAs(staff);
    renderArea(
      staff,
      {
        ...client,
        save: async (...args) => {
          if (failingSaves.remaining > 0) {
            failingSaves.remaining -= 1;
            throw new TypeError('Failed to fetch');
          }
          return client.save(...args);
        },
      },
      [0, 0, 0],
    );
    await screen.findByRole('heading', { name: 'Unreliable' });
    fireEvent.click(
      within(screen.getByRole('complementary', { name: 'Objects' })).getByRole('button', { name: /^End/ }),
    );
    return board;
  };
  const savedObjects = async (id: string) => (await boards.get('usnm', id))!.content.objects.length;

  test('is tried again, and saved once the server is back, without bothering anyone', async () => {
    const failingSaves = { remaining: 2 };
    const board = await openFailing(failingSaves);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    expect(failingSaves.remaining).toBe(0);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(await savedObjects(board.id)).toBe(1);
  });

  test('says so when the retries run out, keeps the changes, and can be tried again', async () => {
    const failingSaves = { remaining: 100 };
    const board = await openFailing(failingSaves);
    const alert = await screen.findByRole('alert', {}, { timeout: 4000 });
    expect(alert.textContent).toMatch(/Your changes couldn’t be saved \(Failed to fetch\)/);
    expect(alert.textContent).toMatch(/don’t close or reload it/);
    // The first save and three retries, then it stops
    expect(failingSaves.remaining).toBe(96);
    expect(screen.getByRole('status').textContent).toBe('Could not save');
    expect(await savedObjects(board.id)).toBe(0);

    // The server's back
    failingSaves.remaining = 0;
    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(await savedObjects(board.id)).toBe(1);
  });
});
