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
import { afterEach, beforeAll, describe, expect, test } from '@jest/globals';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, loadDefinitionFiles } from '@tech-matters/form-builder-server/definitionsApi';
import type { ApiUser } from '@tech-matters/form-builder-shared';

import { createHarness, formDefinitionsDir, helplinesConfigDir } from '../testing/workspaceHarness';

const zaStaff: ApiUser = { name: 'Childline person', role: 'helpline-staff', helplines: ['za'] };

let za: DefinitionFiles;
beforeAll(async () => {
  za = await loadDefinitionFiles(formDefinitionsDir, 'za', 'v1', helplinesConfigDir);
});
afterEach(cleanup);

// An edit that saves: a helpline term
const editSomething = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Helpline terms' }));
  await waitFor(() => expect(screen.queryByText('Loading Aselo’s text…')).toBeNull());
  const child = screen.getByRole('region', { name: /person your helpline supports/ });
  fireEvent.click(within(child).getByRole('button', { name: 'young person' }));
};

const open = async (failingSaves: { remaining: number }) => {
  const harness = createHarness();
  harness.renderWorkspace(za, { user: zaStaff, failingSaves });
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  return harness;
};

describe('a save that fails', () => {
  test('is tried again, and saved once the server is back, without bothering anyone', async () => {
    const failingSaves = { remaining: 2 };
    const harness = await open(failingSaves);
    await editSomething();
    await screen.findByText(/All changes saved/);
    expect(failingSaves.remaining).toBe(0);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(await harness.savedFile(za, 'customStrings/HelplineTerms.json')).toBeDefined();
  });

  test('says so when the retries run out, keeps the changes, and can be tried again', async () => {
    const failingSaves = { remaining: 100 };
    const harness = await open(failingSaves);
    await editSomething();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/Your changes couldn’t be saved \(Failed to fetch\)/);
    expect(alert.textContent).toMatch(/don’t close or reload it/);
    // The first save and three retries, then it stops
    expect(failingSaves.remaining).toBe(96);
    expect(screen.getByText(/· Couldn't save$/)).toBeTruthy();

    // The server's back
    failingSaves.remaining = 0;
    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }));
    await screen.findByText(/All changes saved/);
    expect(screen.queryByRole('alert')).toBeNull();
    expect((await harness.savedFile(za, 'customStrings/HelplineTerms.json')).terms.child.singular).toBe('young person');
  });
});
