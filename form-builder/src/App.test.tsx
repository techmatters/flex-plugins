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
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ApiContext, ApiUser } from '../server/api';
import { handleApiRequest } from '../server/api';
import { MemoryDraftStore } from '../server/drafts';
import { clientFor } from './draftClient';
import { App } from './App';

const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };

let context: ApiContext;
const send = (method: string, apiPath: string, body?: unknown) =>
  handleApiRequest(context, { method, path: apiPath, body: structuredClone(body), user: staff });

beforeEach(() => {
  context = {
    formDefinitionsDir: path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../lambdas/packages/hrm-form-definitions/form-definitions',
    ),
    drafts: new MemoryDraftStore(),
    notifier: { draftSubmitted: async () => {} },
  };
  // The app's own GETs (helplines, definitions) go to the same in-process API
  vi.stubGlobal('fetch', async (url: string) => {
    const response = await send('GET', new URL(url, 'http://localhost').pathname);
    return new Response(JSON.stringify(response.body), { status: response.status });
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('the app', () => {
  test('areas stay as they were left when another is opened; "All forms" goes back to the start page', async () => {
    render(<App draftClient={clientFor(send)} />);
    expect(await screen.findByRole('heading', { name: 'Forms' })).toBeTruthy();

    // Once the helplines are loaded
    await screen.findByRole('option', { name: 'USCH' });
    fireEvent.change(screen.getByRole('combobox', { name: 'Helpline' }), { target: { value: 'usch' } });
    const workspace = await screen.findByText('No changes yet', undefined, { timeout: 15000 });
    expect(screen.queryByRole('heading', { name: 'Forms' })).toBeNull();

    // Off to Contact flows: the helpline's forms are kept, hidden
    fireEvent.click(screen.getByRole('button', { name: 'Contact flows' }));
    expect(workspace.closest('[hidden]')).not.toBeNull();
    // ...and back, as they were
    fireEvent.click(screen.getByRole('button', { name: 'Forms' }));
    expect(workspace.closest('[hidden]')).toBeNull();
    expect(workspace.isConnected).toBe(true);
    expect((screen.getByRole('combobox', { name: 'Helpline' }) as HTMLSelectElement).value).toBe('usch');

    fireEvent.click(screen.getByRole('button', { name: /All forms/ }));
    expect(await screen.findByRole('heading', { name: 'Forms' })).toBeTruthy();
    expect((screen.getByRole('combobox', { name: 'Helpline' }) as HTMLSelectElement).value).toBe('');
  }, 30_000);
});
