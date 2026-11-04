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


import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, beforeEach, describe, expect, test, jest } from '@jest/globals';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ApiContext, ApiUser } from '@tech-matters/form-builder-server/api';
import { handleApiRequest } from '@tech-matters/form-builder-server/api';
import { MemoryDraftStore } from '@tech-matters/form-builder-server/drafts';
import { Provider } from 'react-redux';
import { clientFor } from '../drafts/draftClient';
import { createAppStore } from './store';
import { App } from './App';

const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };

let context: ApiContext;
const send = (method: string, apiPath: string, body?: unknown) =>
  handleApiRequest(context, { method, path: apiPath, body: structuredClone(body), user: staff });

beforeEach(() => {
  context = {
    formDefinitionsDir: path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../../../lambdas/packages/hrm-form-definitions/form-definitions',
    ),
    drafts: new MemoryDraftStore(),
    notifier: { draftSubmitted: async () => {} },
  };
  // The app's own GETs (helplines, definitions) go to the same in-process API
  global.fetch = (async (url: string) => {
    const response = await send('GET', new URL(url, 'http://localhost').pathname);
    return new Response(JSON.stringify(response.body), { status: response.status });
  }) as typeof fetch;
});

const originalFetch = global.fetch;

afterEach(() => {
  cleanup();
  global.fetch = originalFetch;
  window.history.replaceState(null, '', '/');
});

describe('the app', () => {
  test('areas stay as they were left when another is opened; "All forms" goes back to the start page', async () => {
    render(
      <Provider store={createAppStore({ draftClient: clientFor(send) })}>
        <App />
      </Provider>,
    );
    expect(await screen.findByRole('heading', { name: 'Forms' })).toBeTruthy();

    // Forms are opened from the list; Aselo staff add them with the importer (master here)
    const importer = await screen.findByRole('region', { name: 'Import forms' });
    await waitFor(() => expect(within(importer).getAllByRole('option', { name: 'USCH' }).length).toBe(1));
    expect(screen.queryByRole('combobox', { name: 'Helpline' })).toBeNull();
    fireEvent.change(within(importer).getByRole('combobox', { name: 'Helpline to import' }), {
      target: { value: 'usch' },
    });
    fireEvent.click(within(importer).getByRole('button', { name: 'Preview' }));
    fireEvent.click(await within(importer).findByRole('button', { name: 'Import' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Open' }));
    const workspace = await screen.findByText('No changes yet', undefined, { timeout: 15000 });
    expect(screen.queryByRole('heading', { name: 'Forms' })).toBeNull();

    // Off to Contact flows: the helpline's forms are kept, hidden
    fireEvent.click(screen.getByRole('button', { name: 'Contact flows' }));
    expect(workspace.closest('[hidden]')).not.toBeNull();
    // ...and back, as they were
    fireEvent.click(screen.getByRole('button', { name: 'Forms' }));
    expect(workspace.closest('[hidden]')).toBeNull();
    expect(workspace.isConnected).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /All forms/ }));
    expect(await screen.findByRole('heading', { name: 'Forms' })).toBeTruthy();
    // Still in the list until Aselo staff remove it
    expect(await screen.findByRole('button', { name: 'Open' })).toBeTruthy();
  }, 30_000);
});
