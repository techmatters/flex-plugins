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

/**
 * Issue categories, edited through the workspace with USNM's real definitions.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, listHelplines, loadDefinitionFiles } from '../../../server/definitionsApi';
import { aseloStaff, createHarness, formDefinitionsDir, helplinesConfigDir } from '../../testing/workspaceHarness';
import { CATEGORIES_FILE } from '../../definitions';
import { summarizeCategoryChanges, validateCategories } from '../../categories';

let usnm: DefinitionFiles;
beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir);
});

let harness: ReturnType<typeof createHarness>;
beforeEach(() => {
  harness = createHarness();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const categories = (files: Record<string, unknown>) =>
  (files[CATEGORIES_FILE] as Record<string, { categories: Record<string, { color: string; subcategories: { label: string }[] }> }>).NAMI
    .categories;

const open = async (user = harness.renderWorkspace) => {
  user(usnm);
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Issue categories' }));
};

const saved = async () => {
  await screen.findByText(/All changes saved/);
  return (await harness.savedFile(usnm, CATEGORIES_FILE)).NAMI;
};

describe('issue categories editor', () => {
  test('existing names are locked for helpline staff; new categories can be added and named', async () => {
    await open();
    const [firstName] = Object.keys(categories(usnm.files));
    expect((screen.getByDisplayValue(firstName) as HTMLInputElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '+ Add a category' }));
    // USNM already has "Housing": the name is kept as typed, with a message, until it's unique
    fireEvent.change(screen.getByDisplayValue('New category'), { target: { value: 'Housing' } });
    expect(screen.getAllByText(/Another category is already called “Housing”/)).toHaveLength(2);
    fireEvent.change(screen.getAllByDisplayValue('Housing').at(-1)!, { target: { value: 'Housing support' } });
    fireEvent.change(screen.getByDisplayValue('Other'), { target: { value: 'Eviction' } });

    const definition = await saved();
    expect(Object.keys(definition.categories).at(-1)).toBe('Housing support');
    expect(definition.categories['Housing support'].subcategories).toEqual([{ label: 'Eviction' }]);
    // The Aselo preview shows the new category
    expect(screen.getByRole('button', { name: 'Housing support' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Review & submit' }));
    expect(within(screen.getByRole('dialog')).getByText('Added category “Housing support” (Eviction)')).toBeTruthy();
  });

  test('Aselo staff can rename an existing category', async () => {
    await open((definitions) => harness.renderWorkspace(definitions, { user: aseloStaff }));
    const [firstName] = Object.keys(categories(usnm.files));
    fireEvent.change(screen.getByDisplayValue(firstName), { target: { value: `${firstName} (renamed)` } });
    expect(Object.keys((await saved()).categories)[0]).toBe(`${firstName} (renamed)`);
  });

  test('adds subcategories pasted one per line, and sets how many can be chosen', async () => {
    await open();
    const [firstName, first] = Object.entries(categories(usnm.files))[0];
    fireEvent.click(screen.getByRole('button', { name: `${first.subcategories.length} subcategories` }));
    fireEvent.click(screen.getByRole('button', { name: 'Paste several at once' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Subcategories, one per line' }), {
      target: { value: 'First new\nSecond new\n' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add these' }));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5' } });

    const definition = await saved();
    expect(definition.maxSelections).toBe(5);
    expect(definition.categories[firstName].subcategories.slice(-2)).toEqual([
      { label: 'First new' },
      { label: 'Second new' },
    ]);
  });
});

describe('category checks', () => {
  test('categories in the repo today only produce warnings', async () => {
    const helplines = await listHelplines(formDefinitionsDir);
    for (const { code, versions } of helplines) {
      const { files } = await loadDefinitionFiles(formDefinitionsDir, code, versions[0]);
      validateCategories(files, files).forEach((issue) => expect(issue.severity, `${code}: ${issue.message}`).toBe('warning'));
      expect(summarizeCategoryChanges(files, files)).toEqual([]);
    }
  });

  test('a category without subcategories needs fixing', () => {
    const draft = {
      ...usnm.files,
      [CATEGORIES_FILE]: { NAMI: { categories: { ...categories(usnm.files), Empty: { color: '#000000', subcategories: [] } } } },
    };
    expect(validateCategories(draft, usnm.files)).toContainEqual(
      expect.objectContaining({ severity: 'error', message: 'Issue categories: “Empty” has no subcategories.' }),
    );
  });
});
