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
import { MemoryDraftStore } from '../../server/drafts';
import { MemoryRoutingStore } from '../../server/routingStore';
import { routingClientFor } from './routingClient';
import { RoutingArea } from './RoutingArea';
import { readWho } from './expressions';

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
    m22 = 1;
  }
  vi.stubGlobal('ResizeObserver', ResizeObserver);
  vi.stubGlobal('DOMMatrixReadOnly', DOMMatrixReadOnly);
  Element.prototype.scrollIntoView = () => {};
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
    helplinesConfigDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../twilio-iac/helplines'),
    notifier: { draftSubmitted: async () => {} },
  };
});

afterEach(cleanup);

describe('routing designer', () => {
  test('Aselo staff import a live helpline, change a step, and it saves by itself', async () => {
    render(<RoutingArea client={clientAs(staff)} helplineCodes={['usnm', 'usch']} staffMode />);
    expect(await screen.findByText('No routing designs yet.')).toBeTruthy();
    fireEvent.change(screen.getByRole('combobox', { name: 'Helpline' }), {
      target: { value: 'usnm' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Import it from the live config' }));
    const preview = within(await screen.findByRole('region', { name: 'Routing import preview' }));
    expect(preview.getByText('Calls Voicemail Workflow')).toBeTruthy();
    fireEvent.click(preview.getByRole('button', { name: 'Use this as the routing design' }));

    await screen.findByRole('tab', { name: 'Calls Voicemail Workflow' });
    expect((await store.get('usnm'))?.design.workflows).toHaveLength(4);
    const status = () =>
      (screen.getByRole('combobox', { name: 'Status of the routing design' }) as HTMLSelectElement).value;
    expect(status()).toBe('imported');

    // The ES TYA Call rule's first step asks for one more skill
    const card = (await screen.findByDisplayValue('ES TYA Call')).closest('li')!;
    const [firstStep] = within(card as HTMLElement)
      .getAllByRole('listitem')
      .filter((item) => item.className === 'routing-target-row');
    fireEvent.change(within(firstStep).getByRole('combobox', { name: 'Add a skill' }), {
      target: { value: 'FCG' },
    });
    await waitFor(() => expect(screen.getByText('All changes saved')).toBeTruthy(), {
      timeout: 4000,
    });
    const saved = (await store.get('usnm'))!.design.workflows[0].rules.find((rule) => rule.name === 'ES TYA Call')!;
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

    // A rule card's JSON tab shows the filter as written for TaskRouter
    fireEvent.click(screen.getByRole('tab', { name: 'Calls Voicemail Workflow' }));
    const esTya = (await screen.findByDisplayValue('ES TYA Call')).closest('li')!;
    fireEvent.click(within(esTya as HTMLElement).getByRole('tab', { name: 'JSON' }));
    expect(within(esTya as HTMLElement).getByLabelText('Filter JSON').textContent).toContain(
      '"filter_friendly_name": "ES TYA Call"',
    );
    expect(screen.getByRole('button', { name: /Export for Claude/ })).toBeTruthy();
  });

  test('helpline staff start from what Aselo staff imported, and neither import nor export', async () => {
    const imported = await clientAs(staff).previewImport('usnm');
    await clientAs(staff).save('usnm', 0, imported.design);
    render(<RoutingArea client={clientAs(usnmStaff)} helplineCodes={['usnm']} staffMode={false} />);
    await screen.findByRole('tab', { name: 'Calls Voicemail Workflow' });
    expect(screen.queryByRole('button', { name: /Import/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Export for Claude/ })).toBeNull();
    // A queue's workers, in plain words
    fireEvent.click(screen.getByRole('tab', { name: /^Queues/ }));
    expect(screen.getByText('Counselors with Calls or SMS, TYA and Spanish')).toBeTruthy();
  });
});
