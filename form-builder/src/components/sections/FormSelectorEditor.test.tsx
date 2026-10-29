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

import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, loadDefinitionFiles } from '../../../server/definitionsApi';
import {
  aseloStaff,
  createHarness,
  formDefinitionsDir,
  helplinesConfigDir,
  webchatConfigDir,
} from '../../testing/workspaceHarness';

let usnm: DefinitionFiles;
beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir, webchatConfigDir);
});

afterEach(cleanup);

const openPanel = async () => fireEvent.click(await screen.findByRole('button', { name: 'Filling in the contact' }));

describe('Filling in the contact', () => {
  test('helpline staff see it as written, without changing it', async () => {
    createHarness().renderWorkspace(usnm);
    await openPanel();
    const type = screen.getByRole('combobox', { name: 'selectorType' }) as HTMLSelectElement;
    expect(type.value).toBe('staticSelector');
    expect(type.disabled).toBe(true);
    expect((screen.getByRole('combobox', { name: 'callType' }) as HTMLSelectElement).value).toBe(
      'Child calling about self',
    );
    expect(screen.getByText(/"selectorType": "staticSelector"/)).toBeTruthy();
    expect(screen.getByText(/Aselo staff can change this/)).toBeTruthy();
  });

  test('Aselo staff change it, and the review describes it', async () => {
    const { renderWorkspace, savedFile } = createHarness();
    renderWorkspace(usnm, { user: aseloStaff });
    await openPanel();
    expect((screen.getByRole('combobox', { name: 'selectorType' }) as HTMLSelectElement).value).toBe('staticSelector');

    fireEvent.click(screen.getByRole('checkbox', { name: 'CaseInformationTab' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'callType' }), { target: { value: '' } });
    await waitFor(async () =>
      expect((await savedFile(usnm, 'PrepopulateMappings.json'))?.formSelector).toEqual({
        selectorType: 'staticSelector',
        parameter: { availableTabs: ['ChildInformationTab', 'CaseInformationTab'] },
      }),
    );
    // The other mappings are left alone
    expect((await savedFile(usnm, 'PrepopulateMappings.json')).preEngagement).toEqual(
      (usnm.files['PrepopulateMappings.json'] as { preEngagement: unknown }).preEngagement,
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'selectorType' }), {
      target: { value: 'serviceUserChoiceSelector' },
    });
    expect((screen.getByRole('combobox', { name: 'input 0' }) as HTMLInputElement).value).toBe('aboutSelf');
    fireEvent.change(screen.getByRole('combobox', { name: 'form 0' }), { target: { value: 'preEngagement' } });
    expect(screen.getAllByText(/isn’t a question in the webchat form/).length).toBeGreaterThan(0);
    await screen.findByText(/All changes saved/);

    // Back to staticSelector: what was chosen before comes back
    fireEvent.change(screen.getByRole('combobox', { name: 'selectorType' }), { target: { value: 'staticSelector' } });
    expect((screen.getByRole('checkbox', { name: 'CaseInformationTab' }) as HTMLInputElement).checked).toBe(true);

    await screen.findByText(/All changes saved/);
    fireEvent.click(screen.getByRole('button', { name: 'Review & apply' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(
      within(dialog).getByText(
        'Now: Every contact fills in Child information, Case information; call type: none (the counselor picks)',
      ),
    ).toBeTruthy();
  });

  test('not set: the default, and taking the selector out of the file', async () => {
    const { renderWorkspace, savedFile } = createHarness();
    renderWorkspace(usnm, { user: aseloStaff });
    await openPanel();
    fireEvent.change(screen.getByRole('combobox', { name: 'selectorType' }), { target: { value: '' } });
    await waitFor(async () =>
      expect((await savedFile(usnm, 'PrepopulateMappings.json'))?.formSelector).toBeUndefined(),
    );
    expect(screen.getByText('(not in the file)')).toBeTruthy();
  });
});
