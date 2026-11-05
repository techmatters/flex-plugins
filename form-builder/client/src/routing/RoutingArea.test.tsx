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
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { type ApiContext, type ApiUser, handleApiRequest } from '@tech-matters/form-builder-server/api';
import { MemoryDraftStore } from '@tech-matters/form-builder-server/drafts';
import { MemoryRoutingStore } from '@tech-matters/form-builder-server/routingStore';
import { Provider } from 'react-redux';
import { readWho } from '@tech-matters/form-builder-shared/routing/expressions';
import { emptyRouting } from '@tech-matters/form-builder-shared/routing/model';

import { routingClientFor } from './routingClient';
import { RoutingArea } from './RoutingArea';
import { createAppStore } from '../app/store';
import { sessionLoaded } from '../app/sessionSlice';

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
    m22 = 1;
  }
  Object.assign(globalThis, { ResizeObserver });
  Object.assign(globalThis, { DOMMatrixReadOnly });
  Element.prototype.scrollIntoView = () => undefined;
});

const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };

let store: MemoryRoutingStore;
let context: ApiContext;
const clientAs = (user: ApiUser) =>
  routingClientFor((method, apiPath, body) =>
    handleApiRequest(context, { method, path: apiPath, body: structuredClone(body), user }),
  );

beforeEach(() => {
  store = new MemoryRoutingStore();
  context = {
    formDefinitionsDir: '/nowhere',
    drafts: new MemoryDraftStore(),
    routing: store,
    helplinesConfigDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../twilio-iac/helplines'),
    notifier: { draftSubmitted: async () => undefined },
  };
});

afterEach(cleanup);

// The designer as this person sees it, with these helplines to open
const renderAs = (user: ApiUser, helplineCodes: string[]) => {
  const appStore = createAppStore({ routingClient: clientAs(user) });
  appStore.dispatch(
    sessionLoaded({
      user: { ...user, applyInBuilder: false },
      helplines: helplineCodes.map(code => ({ code, versions: ['v1'] })),
    }),
  );
  return render(
    <Provider store={appStore}>
      <RoutingArea />
    </Provider>,
  );
};

// Imports read the repo's helplines, which takes a while when every test file runs at once
// Each test renders the whole designer: more time than the usual 20 seconds
jest.setTimeout(30_000);

describe('routing designer', () => {
  test('Aselo staff import a live helpline, change a step, and it saves by itself', async () => {
    renderAs(staff, ['usnm', 'usch']);
    expect(await screen.findByText('No routing designs yet.')).toBeTruthy();
    fireEvent.change(screen.getByRole('combobox', { name: 'Helpline' }), {
      target: { value: 'usnm' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Import it from the live config' }));
    const preview = within(await screen.findByRole('region', { name: 'Routing import preview' }, { timeout: 15_000 }));
    expect(preview.getByText('Calls Voicemail Workflow')).toBeTruthy();
    fireEvent.click(preview.getByRole('button', { name: 'Use this as the routing design' }));

    await screen.findByRole('tab', { name: 'Calls Voicemail Workflow' });
    expect((await store.get('usnm'))?.design.workflows).toHaveLength(4);
    const status = () =>
      (screen.getByRole('combobox', { name: 'Status of the routing design' }) as HTMLSelectElement).value;
    expect(status()).toBe('imported');

    // Cards start collapsed, with a one-line summary
    const card = (await screen.findByDisplayValue('ES TYA Call')).closest('li')!;
    expect(within(card as HTMLElement).getByText(/Voice · Service: .*TYA.*Spanish/i)).toBeTruthy();
    expect(within(card as HTMLElement).queryByRole('listitem')).toBeNull();
    // The ES TYA Call rule's first step asks for one more skill
    fireEvent.click(within(card as HTMLElement).getByRole('button', { name: 'Expand ES TYA Call' }));
    const [firstStep] = within(card as HTMLElement)
      .getAllByRole('listitem')
      .filter(item => item.className === 'routing-target-row');
    fireEvent.change(within(firstStep).getByRole('combobox', { name: 'Add a skill' }), {
      target: { value: 'FCG' },
    });
    await waitFor(() => expect(screen.getByText('All changes saved')).toBeTruthy(), {
      timeout: 4000,
    });
    const saved = (await store.get('usnm'))!.design.workflows[0].rules.find(rule => rule.name === 'ES TYA Call')!;
    expect(saved.targets[0].who).toContainEqual({
      kind: 'skills',
      skills: ['Calls', 'Spanish', 'TYA', 'FCG'],
    });
    expect(readWho(String(saved.targets[1].original?.expression))).toEqual(saved.targets[1].who);
    // Changed, so it's in progress again
    expect(status()).toBe('in-progress');
    expect((await store.get('usnm'))!.design.status).toBe('in-progress');

    // Test a task: a Spanish TYA call
    fireEvent.click(screen.getByRole('tab', { name: 'Test a task' }));
    const tester = within(screen.getByRole('region', { name: 'Test a task' }));
    const pick = (label: string, value: string) => {
      const row = tester.getByText(label, { selector: '.routing-test-label' }).closest('.routing-test-row')!;
      fireEvent.click(within(row as HTMLElement).getByRole('button', { name: value }));
    };
    pick('Channel', 'Voice');
    pick('Service', 'TYA');
    pick('Language', 'Spanish');
    expect(tester.getByText('ES TYA Call', { selector: 'strong' })).toBeTruthy();
    // A value no rule names can be typed
    fireEvent.change(tester.getByRole('textbox', { name: 'Another Service' }), { target: { value: 'Advocates' } });
    expect(tester.getByText(/isn't taken by any rule/)).toBeTruthy();
    fireEvent.click(
      within(
        tester.getByText('Service', { selector: '.routing-test-label' }).closest('.routing-test-row') as HTMLElement,
      ).getByRole('button', { name: 'TYA' }),
    );
    expect(tester.getByText('ES TYA Call', { selector: 'strong' })).toBeTruthy();

    // A rule card's JSON tab shows the filter as written for TaskRouter
    fireEvent.click(screen.getByRole('tab', { name: 'Calls Voicemail Workflow' }));
    const esTya = (await screen.findByDisplayValue('ES TYA Call')).closest('li')!;
    if (!within(esTya as HTMLElement).queryByRole('button', { name: 'Collapse ES TYA Call' })) {
      fireEvent.click(within(esTya as HTMLElement).getByRole('button', { name: 'Expand ES TYA Call' }));
    }
    // A value no rule uses yet (a new service) is typed after choosing "Another value…"
    const service = within(esTya as HTMLElement)
      .getAllByRole('combobox', { name: 'Value' })
      .find(select => (select as HTMLSelectElement).value === 'tya')!;
    fireEvent.change(service, { target: { value: '__another value__' } });
    const newValue = within(esTya as HTMLElement).getByRole('combobox', { name: 'Add a value' });
    fireEvent.change(newValue, { target: { value: 'Advocates' } });
    fireEvent.keyDown(newValue, { key: 'Enter' });
    fireEvent.click(within(esTya as HTMLElement).getByRole('tab', { name: 'JSON' }));
    expect(within(esTya as HTMLElement).getByLabelText('Filter JSON').textContent).toContain(
      '"filter_friendly_name": "ES TYA Call"',
    );
    expect(within(esTya as HTMLElement).getByLabelText('Filter JSON').textContent).toContain('Advocates');
    expect(screen.getByRole('button', { name: /Export for Claude/ })).toBeTruthy();
  });

  test('helpline staff start from what Aselo staff imported, and neither import nor export', async () => {
    const imported = await clientAs(staff).previewImport('usnm');
    await clientAs(staff).save('usnm', 0, imported.design);
    renderAs(usnmStaff, ['usnm']);
    await screen.findByRole('tab', { name: 'Calls Voicemail Workflow' });
    expect(screen.queryByRole('button', { name: /Import/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Export for Claude/ })).toBeNull();
    // A queue's workers, in plain words
    fireEvent.click(screen.getByRole('tab', { name: /^Queues/ }));
    expect(screen.getByText('Counselors with Calls or SMS, TYA and Spanish')).toBeTruthy();
  });
});

describe('a routing save that fails', () => {
  // Saves fail (as when the server can't be reached) while `remaining` is above 0
  const openFailing = async (failingSaves: { remaining: number }) => {
    await clientAs(staff).save('usnm', 0, emptyRouting('usnm'));
    const client = clientAs(staff);
    const appStore = createAppStore({
      routingClient: {
        ...client,
        save: async (...args) => {
          if (failingSaves.remaining > 0) {
            failingSaves.remaining -= 1;
            throw new TypeError('Failed to fetch');
          }
          return client.save(...args);
        },
      },
      saveRetryDelaysMs: [0, 0, 0],
    });
    appStore.dispatch(
      sessionLoaded({ user: { ...staff, applyInBuilder: false }, helplines: [{ code: 'usnm', versions: ['v1'] }] }),
    );
    render(
      <Provider store={appStore}>
        <RoutingArea />
      </Provider>,
    );
    // An empty design opens at its queues
    fireEvent.change(await screen.findByRole('textbox', { name: "New queue's name" }), {
      target: { value: 'Spanish' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add a queue' }));
  };
  const savedQueues = async () => (await store.get('usnm'))!.design.queues.map(queue => queue.name);

  test('is tried again, and saved once the server is back, without bothering anyone', async () => {
    const failingSaves = { remaining: 2 };
    await openFailing(failingSaves);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'), { timeout: 4000 });
    expect(failingSaves.remaining).toBe(0);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(await savedQueues()).toEqual(['Spanish']);
  });

  test('says so when the retries run out, keeps the changes, and can be tried again', async () => {
    const failingSaves = { remaining: 100 };
    await openFailing(failingSaves);
    const alert = await screen.findByRole('alert', {}, { timeout: 4000 });
    expect(alert.textContent).toMatch(/Your changes couldn’t be saved \(Failed to fetch\)/);
    expect(alert.textContent).toMatch(/don’t close or reload it/);
    // The first save and three retries, then it stops
    expect(failingSaves.remaining).toBe(96);
    expect(screen.getByRole('status').textContent).toBe('Could not save');
    expect(await savedQueues()).toEqual([]);

    // The server's back
    failingSaves.remaining = 0;
    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('All changes saved'));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(await savedQueues()).toEqual(['Spanish']);
  });
});
