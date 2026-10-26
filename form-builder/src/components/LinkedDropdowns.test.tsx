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
 * Linked dropdowns, driven through the UI with real helpline definitions.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import { DefinitionFiles, loadDefinitionFiles } from '../../server/definitionsApi';
import { createHarness } from '../testing/workspaceHarness';

const formDefinitionsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../lambdas/packages/hrm-form-definitions/form-definitions',
);

let usnm: DefinitionFiles;
let demo: DefinitionFiles;
let ph: DefinitionFiles;

beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1');
  demo = await loadDefinitionFiles(formDefinitionsDir, 'as', 'v1');
  ph = await loadDefinitionFiles(formDefinitionsDir, 'ph', 'v1');
});


let harness: ReturnType<typeof createHarness>;
beforeEach(() => {
  harness = createHarness();
});

// Renders the workspace and waits for the (empty) draft to load
const renderLoaded = async (definitions: DefinitionFiles) => {
  harness.renderWorkspace(definitions);
  await waitFor(() => expect(screen.queryByText('Loading the draft…')).toBeNull());
};

// A file as saved in the draft, once the latest change has been saved
const savedDraftFile = async (definitions: DefinitionFiles, filePath: string) => {
  await screen.findByText(/All changes saved/);
  return harness.savedFile(definitions, filePath);
};
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const fieldCard = (label: string) =>
  screen.getByRole('button', { name: `${label}. Click to edit, or drag to move.` });

// The draft as saved on the server, for checking what will be applied
const savedDraftForm = async (definitions: DefinitionFiles, filePath: string) =>
  (await savedDraftFile(definitions, filePath)) as (FormItemJsonDefinition & Record<string, unknown>)[];

const labelOf = (definitions: DefinitionFiles, filePath: string, name: string) =>
  (definitions.files[filePath] as FormItemJsonDefinition[]).find((item) => item.name === name)!
    .label;

const startWizard = (levelLabels: string[]) => {
  fireEvent.click(screen.getAllByRole('button', { name: '+ Add a field' })[0]);
  fireEvent.click(screen.getByRole('button', { name: /^Linked dropdowns/ }));
  const wizard = screen.getByRole('dialog', { name: 'Add linked dropdowns' });
  const inputs = within(wizard).getAllByRole('textbox');
  levelLabels.forEach((label, index) => fireEvent.change(inputs[index], { target: { value: label } }));
  fireEvent.click(within(wizard).getByRole('button', { name: 'Next: answers' }));
  return screen.getByRole('dialog', { name: `Answers for ${levelLabels.join(' → ')}` });
};

const addAnswer = (column: HTMLElement, label: string) => {
  const input = within(column).getByRole('textbox', { name: /^Add a / });
  fireEvent.change(input, { target: { value: label } });
  fireEvent.click(within(column).getByRole('button', { name: 'Add' }));
};

describe('linked dropdowns', () => {
  test('creating them from cells pasted from a spreadsheet', async () => {
    await renderLoaded(usnm);
    const editor = startWizard(['Province', 'District']);

    fireEvent.click(within(editor).getByRole('button', { name: 'Import from a spreadsheet' }));
    fireEvent.change(within(editor).getByRole('textbox'), {
      target: { value: 'Province\tDistrict\nAbra\tBangued\nAbra\tBoliney\nCebu\tLahug\n' },
    });
    fireEvent.click(within(editor).getByRole('button', { name: 'Use pasted cells' }));

    // The heading row is recognised and left out
    const headerCheckbox = within(editor).getByRole('checkbox', {
      name: /first row has column names/,
    }) as HTMLInputElement;
    expect(headerCheckbox.checked).toBe(true);
    const summary = editor.querySelector('.import-summary')!.textContent;
    expect(summary).toContain('2 Province');
    expect(summary).toContain('3 District');

    fireEvent.click(within(editor).getByRole('button', { name: 'Replace all answers with these' }));
    const provinces = within(editor).getByRole('region', { name: 'Province' });
    expect(within(provinces).getByText('Abra')).toBeTruthy();
    fireEvent.click(within(editor).getByRole('button', { name: 'Add these dropdowns' }));

    expect(fieldCard('Province')).toBeTruthy();
    expect(fieldCard('District')).toBeTruthy();

    const form = await savedDraftForm(usnm, 'tabbedForms/CallerInformationTab.json');
    const province = form.find((item) => item.name === 'province')!;
    const district = form.find((item) => item.name === 'district')!;
    expect(province).toMatchObject({ type: 'select' });
    expect((province.options as { value: string }[]).map((o) => o.value)).toEqual([
      expect.any(String), // the helpline's blank first answer
      'Abra',
      'Cebu',
    ]);
    expect(district).toMatchObject({
      type: 'dependent-select',
      dependsOn: 'province',
      options: {
        Abra: [
          { value: 'Bangued', label: 'Bangued' },
          { value: 'Boliney', label: 'Boliney' },
        ],
        Cebu: [{ value: 'Lahug', label: 'Lahug' }],
      },
    });
  });

  test('typing answers by hand, and going back a step keeps them', async () => {
    await renderLoaded(usnm);
    let editor = startWizard(['Experiencing abuse?', 'Risk level']);

    const firstColumn = () => within(editor).getByRole('region', { name: 'Experiencing abuse?' });
    addAnswer(firstColumn(), 'Yes');
    addAnswer(firstColumn(), 'No');
    fireEvent.click(within(firstColumn()).getByText('Yes'));

    const secondColumn = within(editor).getByRole('region', { name: 'Risk level' });
    fireEvent.click(within(secondColumn).getByRole('button', { name: 'Paste several at once' }));
    fireEvent.change(within(secondColumn).getByRole('textbox'), {
      target: { value: 'Low\nHigh\n\nLow' },
    });
    fireEvent.click(within(secondColumn).getByRole('button', { name: 'Add these' }));
    expect(within(secondColumn).getAllByRole('button', { name: /^(Low|High)$/ })).toHaveLength(2);

    fireEvent.click(within(editor).getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next: answers' }));
    editor = screen.getByRole('dialog', { name: 'Answers for Experiencing abuse? → Risk level' });
    expect(within(firstColumn()).getByText('Yes')).toBeTruthy();
    fireEvent.click(within(editor).getByRole('button', { name: 'Add these dropdowns' }));

    const form = await savedDraftForm(usnm, 'tabbedForms/CallerInformationTab.json');
    expect(form.find((item) => item.name === 'riskLevel')).toMatchObject({
      dependsOn: 'experiencingAbuse',
      options: {
        Yes: [
          { value: 'Low', label: 'Low' },
          { value: 'High', label: 'High' },
        ],
      },
    });
  });

  test('editing the answers of existing linked dropdowns', async () => {
    const childTab = 'tabbedForms/ChildInformationTab.json';
    await renderLoaded(demo);
    fireEvent.click(screen.getByRole('button', { name: 'Child information' }));
    fireEvent.click(fieldCard(labelOf(demo, childTab, 'district')));
    fireEvent.click(screen.getByRole('button', { name: 'Edit answers' }));

    const editor = screen.getByRole('dialog', { name: /^Answers for / });
    const provinceLabel = labelOf(demo, childTab, 'province');
    const districtLabel = labelOf(demo, childTab, 'district');
    const provinces = within(editor).getByRole('region', { name: provinceLabel });
    const firstProvince = within(provinces).getAllByRole('button', { name: /, \d+ below$/ })[0];
    const provinceName = firstProvince.querySelector('span')!.textContent!;
    fireEvent.click(firstProvince);

    addAnswer(within(editor).getByRole('region', { name: districtLabel }), 'New District');
    fireEvent.click(within(editor).getByRole('button', { name: 'Save answers' }));

    expect(within(fieldCard(districtLabel)).getByText('Edited')).toBeTruthy();
    const district = (await savedDraftForm(demo, childTab)).find((item) => item.name === 'district')!;
    const lists = district.options as Record<string, { value: string }[]>;
    // In this data each province's saved value is its name
    expect(lists[provinceName].map((option) => option.value)).toContain('New District');
  });

  test('PH’s tens of thousands of barangays open, with a note about names shared between provinces', async () => {
    const childTab = 'tabbedForms/ChildInformationTab.json';
    await renderLoaded(ph);
    fireEvent.click(screen.getByRole('button', { name: 'Child information' }));
    fireEvent.click(fieldCard(labelOf(ph, childTab, 'district')));
    fireEvent.click(screen.getByRole('button', { name: 'Edit answers' }));

    const editor = screen.getByRole('dialog', { name: /^Answers for / });
    expect(within(editor).getByText(/share a name with another answer/)).toBeTruthy();
    const lastLevelLabel = labelOf(ph, childTab, 'district');
    const footer = editor.querySelector('.modal-footer p')!.textContent!;
    const lastLevelCount = Number(
      footer.match(new RegExp(`([\\d,]+) ${lastLevelLabel}`))![1].replace(/,/g, ''),
    );
    expect(lastLevelCount).toBeGreaterThan(30000);
    // The shared list in ReferenceData.json is also used by the case forms
    expect(within(editor).getAllByText(/shared with .*\(case\)/).length).toBeGreaterThan(0);
  });
});
