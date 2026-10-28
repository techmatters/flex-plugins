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

import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ApiContext, ApiUser } from '../../server/api';
import { handleApiRequest } from '../../server/api';
import { MemoryBoardStore } from '../../server/boards';
import { MemoryPeopleStore } from '../../server/people';
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
let context: ApiContext;

const clientAs = (user: ApiUser) =>
  boardClientFor((method, path, body) =>
    handleApiRequest(context, { method, path, body: structuredClone(body), user }),
  );

beforeEach(() => {
  window.history.replaceState(null, '', '/?area=flows');
  boards = new MemoryBoardStore();
  people = new MemoryPeopleStore();
  context = {
    formDefinitionsDir: '/nowhere',
    drafts: new MemoryDraftStore(),
    boards,
    people,
    notifier: { draftSubmitted: async () => {} },
  };
});

afterEach(cleanup);

describe('flow designer', () => {
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
    expect(settings().getByText('Decision names start with split_.')).toBeTruthy();
    expect(screen.getByLabelText('Has problems')).toBeTruthy();

    // Two voice messages: the second one's suggested name doesn't repeat the first
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    fireEvent.click(settings().getByRole('button', { name: 'Use play_message_voice' }));
    fireEvent.click(palette().getByRole('button', { name: /^Play message/ }));
    expect(settings().getByRole('button', { name: 'Use play_message_voice_2' })).toBeTruthy();
    fireEvent.change(settings().getByRole('textbox', { name: /^Studio name/ }), {
      target: { value: 'play_message_voice' },
    });
    expect(settings().getByText('Another object in this flow is also named play_message_voice.')).toBeTruthy();
  });

  test('the skilled worker checks hold their route settings and are named after the route', async () => {
    const board = await openNewBoard('Skills');
    fireEvent.click(palette().getByRole('button', { name: /^Skilled worker available/ }));
    expect(settings().getByText('No Studio name yet.')).toBeTruthy();
    fireEvent.change(settings().getByRole('textbox', { name: /^Skills/ }), { target: { value: 'TYA,Calls' } });
    fireEvent.change(settings().getByRole('combobox', { name: /^Channel/ }), { target: { value: 'voice' } });
    fireEvent.click(settings().getByRole('button', { name: 'Use f_isSkilledWorkerAvailable_tya_calls' }));
    expect(settings().queryByText('No Studio name yet.')).toBeNull();

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    expect((await boards.get('usnm', board.id))?.content.objects[0]).toMatchObject({
      type: 'checkQueueAvailability',
      studioName: 'f_isSkilledWorkerAvailable_tya_calls',
      settings: { targetSkills: 'TYA,Calls', targetChannel: 'voice' },
    });
    expect(palette().getByRole('button', { name: /^Skilled worker logged in/ })).toBeTruthy();
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
