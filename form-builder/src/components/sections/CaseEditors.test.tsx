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
 * Case section forms, case statuses and case sections, edited through the workspace with
 * USNM's real definitions.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { DefinitionFiles, listHelplines, loadDefinitionFiles } from '../../../server/definitionsApi';
import { createHarness, formDefinitionsDir, helplinesConfigDir } from '../../testing/workspaceHarness';
import { validateCaseStatuses } from '../../caseStatuses';
import { validateCaseSections } from '../../caseSections';

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

const open = async (navLabel: string) => {
  harness.renderWorkspace(usnm);
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: navLabel }));
};

const saved = async (filePath: string) => {
  await screen.findByText(/All changes saved/);
  return harness.savedFile(usnm, filePath);
};

describe('case section forms', () => {
  test('a case section form is edited like a contact form, and listed in the review', async () => {
    await open('Note');
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add a field' })[0]);
    fireEvent.click(screen.getByRole('button', { name: /^Short text/ }));
    fireEvent.change(screen.getByDisplayValue('New question'), { target: { value: 'Next step' } });

    expect((await saved('caseForms/NoteForm.json')).map((item: { name: string }) => item.name)).toContain('nextStep');
    fireEvent.click(screen.getByRole('button', { name: 'Review & submit' }));
    const dialog = screen.getByRole('dialog', { name: 'Review your changes' });
    expect(within(dialog).getByText('Case section: Note')).toBeTruthy();
    expect(within(dialog).getByText('Next step (nextStep)')).toBeTruthy();
  });

  test('previews the section form in Aselo', async () => {
    await open('Referral');
    fireEvent.click(screen.getByRole('button', { name: 'Preview in Aselo' }));
    expect(screen.getByRole('dialog', { name: 'Referral in Aselo' })).toBeTruthy();
  });
});

describe('case statuses', () => {
  test('adds a status saved under a value from its name, which other statuses can move to', async () => {
    await open('Case statuses');
    fireEvent.click(screen.getByRole('button', { name: '+ Add a status' }));
    fireEvent.change(screen.getByDisplayValue('New status'), { target: { value: 'Waiting for callback' } });
    const openRow = (screen.getAllByRole('textbox', { name: 'Status name' }) as HTMLInputElement[])
      .find((input) => input.value === 'Open')!
      .closest('.status-row') as HTMLElement;
    fireEvent.click(within(openRow).getByRole('checkbox', { name: 'Waiting for callback' }));

    const statuses = await saved('CaseStatus.json');
    expect(statuses.waitingForCallback).toEqual({
      value: 'waitingForCallback',
      label: 'Waiting for callback',
      color: 'blue',
      transitions: ['closed'],
    });
    expect(statuses.open.transitions).toEqual(['closed', 'waitingForCallback']);
    // The preview: an open case can move to the new status
    expect(within(screen.getByRole('list', { name: 'Statuses offered' })).getByText('Waiting for callback')).toBeTruthy();
  });

  test('open and closed cannot be removed', async () => {
    await open('Case statuses');
    expect(screen.queryByRole('button', { name: 'Remove Open' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Remove Closed' })).toBeNull();
  });

  test('flags transitions to statuses that do not exist (CA, MT and TZ today)', async () => {
    const ca = await loadDefinitionFiles(formDefinitionsDir, 'ca', 'v1');
    expect(validateCaseStatuses(ca.files, ca.files)).toContainEqual(
      expect.objectContaining({ severity: 'warning', message: expect.stringContaining('“ongoing”, which isn’t a status') }),
    );
  });
});

describe('case sections', () => {
  test('adds a section with its form, place on the case and texts', async () => {
    await open('Sections');
    fireEvent.change(screen.getByRole('textbox', { name: 'New section name' }), { target: { value: 'Safety plan' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Add a section' }));

    expect((await saved('CaseSections.json')).safetyPlan).toEqual({
      label: 'Safety plan',
      formPath: 'caseForms/SafetyPlanForm.json',
    });
    expect(await harness.savedFile(usnm, 'caseForms/SafetyPlanForm.json')).toEqual([
      { name: 'details', label: 'Details', type: 'textarea', isPII: true },
    ]);
    const layout = await harness.savedFile(usnm, 'LayoutDefinitions.json');
    expect(layout.case.sectionTypes.safetyPlan).toMatchObject({ previewFields: ['details'] });
    const substitutions = await harness.savedFile(usnm, 'customStrings/Substitutions.json');
    expect(substitutions.en['Case-SectionList-Title/safetyPlan']).toBe('Safety plan');

    // Its form is in the menu, and the heading can be changed
    expect(screen.getByRole('button', { name: 'Safety plan' })).toBeTruthy();
    const row = (screen.getAllByRole('textbox', { name: 'Section name' }) as HTMLInputElement[])
      .find((input) => input.value === 'Safety plan')!
      .closest('.case-section-row') as HTMLElement;
    fireEvent.change(within(row).getByRole('textbox', { name: 'Heading on the case' }), {
      target: { value: 'Safety plans' },
    });
    expect((await saved('customStrings/Substitutions.json')).en['Case-SectionList-Title/safetyPlan']).toBe(
      'Safety plans',
    );
  });

  test('existing sections can only be removed by Aselo staff', async () => {
    await open('Sections');
    expect(screen.queryByRole('button', { name: 'Remove Note' })).toBeNull();
  });

  test('sections and statuses in the repo today only produce warnings', async () => {
    for (const { code, versions } of await listHelplines(formDefinitionsDir)) {
      const { files } = await loadDefinitionFiles(formDefinitionsDir, code, versions[0]);
      validateCaseSections(files, files).forEach((issue) =>
        expect(issue.severity, `${code}: ${issue.message}`).toBe('warning'),
      );
      validateCaseStatuses(files, files).forEach((issue) =>
        expect(issue.severity, `${code}: ${issue.message}`).toBe('warning'),
      );
    }
  });
});
