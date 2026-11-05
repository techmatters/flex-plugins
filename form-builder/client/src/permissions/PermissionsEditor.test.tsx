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
import type { ApiUser, PermissionRules } from '@tech-matters/form-builder-shared';

import { aseloStaff, createHarness, formDefinitionsDir, helplinesConfigDir } from '../testing/workspaceHarness';
import { PERMISSION_ACTIONS } from './permissions';

const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };
const FILE = 'hrm-permission-rules/usnm.json';

// As USNM's: no cases
const RULES: PermissionRules = {
  ...Object.fromEntries(PERMISSION_ACTIONS.map(action => [action.key, [['isSupervisor']]])),
  ...Object.fromEntries(PERMISSION_ACTIONS.filter(action => action.target === 'case').map(action => [action.key, []])),
  viewContact: [['isSupervisor'], ['isOwner']],
  viewContactField: [],
  editContactField: [],
};

let usnm: DefinitionFiles;
beforeAll(async () => {
  const loaded = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir);
  usnm = {
    ...loaded,
    files: { ...loaded.files, [FILE]: RULES },
    permissions: {
      name: 'usnm',
      environments: { staging: 'usnm', production: 'usnm' },
      sharedWith: [],
      clientProfiles: false,
      source: 'test',
    },
  };
});
afterEach(cleanup);

const open = async (user: ApiUser) => {
  const harness = createHarness();
  harness.renderWorkspace(usnm, { user });
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
  return harness;
};

describe('permissions', () => {
  test('Aselo staff change who can do what; unused cases and profiles are folded away', async () => {
    const harness = await open(aseloStaff);
    expect(screen.getByText(/doesn’t use cases/)).toBeTruthy();
    expect(screen.getByText(/Client profiles are switched off/)).toBeTruthy();

    const contacts = screen.getByRole('region', { name: 'Contacts' });
    const viewRecording = within(contacts).getByText('Listen to a recording').closest('li')!;
    expect(within(viewRecording as HTMLElement).getAllByText('Supervisors').length).toBeGreaterThan(0);
    fireEvent.click(within(viewRecording as HTMLElement).getByRole('button', { name: /Another way to be allowed/ }));
    const ways = within(viewRecording as HTMLElement).getAllByRole('combobox', { name: 'Add a condition' });
    fireEvent.change(ways[1], { target: { value: 'isOwner' } });
    // (the new way starts as supervisors; and the contact's owner)
    await waitFor(async () =>
      expect((await harness.store.get('usnm', 'v1'))?.files[FILE]).toMatchObject({
        viewRecording: [['isSupervisor'], ['isSupervisor', 'isOwner']],
      }),
    );
    expect(screen.getByRole('region', { name: 'Changes' }).textContent).toContain('Listen to a recording');

    // A condition HRM doesn't take on cases isn't offered; cases can be set up
    fireEvent.click(screen.getByRole('button', { name: 'Set up case permissions' }));
    const cases = screen.getByRole('region', { name: 'Cases' });
    const viewCase = within(cases).getByText('See a case').closest('li') as HTMLElement;
    fireEvent.click(within(viewCase).getByRole('button', { name: /Another way to be allowed/ }));
    const options = within(within(viewCase).getByRole('combobox', { name: 'Add a condition' }))
      .getAllByRole('option')
      .map(option => option.textContent);
    expect(options).toContain('The case’s creator');
    expect(options).not.toContain('The contact’s owner');
  });

  test('helpline staff see them, can’t change them, and comment on them', async () => {
    const harness = await open(usnmStaff);
    expect(screen.getByText(/The Aselo team sets these/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Download for the hrm repo' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Set up case permissions' })).toBeNull();
    const contacts = screen.getByRole('region', { name: 'Contacts' });
    expect(
      within(contacts)
        .getAllByRole('button', { name: /Another way to be allowed/ })
        .every(button => button.matches(':disabled')),
    ).toBe(true);

    const review = screen.getByRole('region', { name: 'Review: permissions' });
    fireEvent.click(within(review).getByRole('button', { name: '+ Flag or comment' }));
    fireEvent.change(within(review).getByRole('textbox', { name: 'New comment' }), {
      target: { value: 'Can counselors listen to their own recordings?' },
    });
    fireEvent.click(within(review).getByRole('button', { name: 'Add' }));
    await within(review).findByText('Can counselors listen to their own recordings?');
    expect((await harness.store.get('usnm', 'v1'))?.meta.threads?.[0]).toMatchObject({
      target: 'section:permissions',
    });
  });
});
