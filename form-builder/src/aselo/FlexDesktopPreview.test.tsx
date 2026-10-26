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
 * The "Try it out" agent desktop, with real helpline definitions and the plugin's translations.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { FormItemJsonDefinition } from '@hrm-form-definitions/formDefinition/types';
import { DefinitionFiles, loadDefinitionFiles } from '../../server/definitionsApi';
import type { ContactTab } from '../definitions';
import { FlexDesktopPreview, PreviewFocus } from './FlexDesktopPreview';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const formDefinitionsDir = path.join(repoRoot, 'lambdas/packages/hrm-form-definitions/form-definitions');
const helplinesConfigDir = path.join(repoRoot, 'twilio-iac/helplines');

let usnm: DefinitionFiles;
let demo: DefinitionFiles;

beforeAll(async () => {
  usnm = await loadDefinitionFiles(formDefinitionsDir, 'usnm', 'v1', helplinesConfigDir);
  demo = await loadDefinitionFiles(formDefinitionsDir, 'as', 'v1', helplinesConfigDir);
});

afterEach(cleanup);

const formOf = (definitions: DefinitionFiles, tab: string) =>
  definitions.files[`tabbedForms/${tab}.json`] as FormItemJsonDefinition[];

const renderDesktop = (
  definitions: DefinitionFiles,
  initialTab?: ContactTab['key'],
  onClose = () => {},
  focus?: PreviewFocus,
) =>
  render(
    <FlexDesktopPreview
      definitions={definitions}
      files={definitions.files}
      initialTab={initialTab}
      focus={focus}
      onClose={onClose}
    />,
  );

// Labels of required fields end with the red asterisk, so match the start
const labelled = (label: string) => new RegExp(`^${label}`);

describe('FlexDesktopPreview', () => {
  test('shows the form inside a mock of the agent desktop', async () => {
    renderDesktop(usnm);
    await screen.findByRole('tab', { name: 'Demographics' });
    expect(screen.getByRole('complementary', { name: 'Contacts waiting (sample)' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Side bar (sample)' })).toBeTruthy();
    expect(screen.getByRole('separator', { name: 'Drag to resize' })).toBeTruthy();
    // No production logo is configured for USNM, so the wordmark stands in
    expect(document.querySelector('.flex-header .flex-wordmark')?.textContent).toBe('Aselo');
    expect(screen.getByText('(preview)')).toBeTruthy();
    // One sample queue, named after the helpline (HelplineInformation.json)
    const queues = screen.getByRole('complementary', { name: 'Contacts waiting (sample)' });
    expect(within(queues).getByText('NAMI')).toBeTruthy();
  });

  test('the sample chat opens with the helpline’s own welcome message', async () => {
    renderDesktop(usnm);
    const messages = usnm.files['customStrings/Messages.json'] as Record<string, Record<string, string>>;
    expect(await screen.findByText(messages.en.WelcomeMsg)).toBeTruthy();

    fireEvent.change(screen.getByRole('combobox', { name: 'Task' }), { target: { value: 'call' } });
    expect(screen.getByText('Hang Up')).toBeTruthy();
  });

  test('uses the helpline’s own tab names and wording', async () => {
    renderDesktop(usnm, 'CallerInformationTab');
    // USNM renames the tabs in its customStrings/Substitutions.json
    expect(await screen.findByRole('tab', { name: 'Help Seeker' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Demographics' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Need/Problem' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Resources Shared' })).toBeTruthy();
    expect(screen.getByText('Categorize Connection Type')).toBeTruthy();
  });

  test('starts on the call type screen; its buttons decide whether there is a Caller tab', async () => {
    renderDesktop(demo, undefined, () => {}, 'callTypes');
    const buttons = demo.files['CallTypeButtons.json'] as { name: string; label: string; category: string }[];
    const caller = buttons.find((button) => button.name === 'caller')!;
    const child = buttons.find((button) => button.name === 'child')!;

    fireEvent.click(await screen.findByRole('button', { name: new RegExp(caller.label) }));
    const tabNames = screen.getAllByRole('tab').map((tab) => tab.textContent);
    expect(tabNames.length).toBe(5); // search, caller, child, categories, summary

    // The back button returns to the call type screen
    // (its wording differs per helpline)
    fireEvent.click(document.querySelector('.aselo-back-button')!);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(child.label) }));
    expect(screen.getAllByRole('tab').length).toBe(4);
  });

  test('a button that closes the contact asks for confirmation first', async () => {
    renderDesktop(demo, undefined, () => {}, 'callTypes');
    const buttons = demo.files['CallTypeButtons.json'] as { name: string; label: string; category: string }[];
    const nonData = buttons.find((button) => button.category === 'non-data')!;
    // Wait for the translations, which the dialog's wording comes from
    await screen.findByText(/categorize/i);
    fireEvent.click(await screen.findByRole('button', { name: nonData.label }));
    const dialog = await screen.findByRole('dialog', { name: 'Are you sure?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'End Chat' }));
    expect(screen.getByText('Aselo would save this contact.')).toBeTruthy();
  });

  test('canned responses fill the message box, and show while editing them even if switched off', async () => {
    renderDesktop(usnm, undefined, () => {}, 'cannedResponses');
    expect(await screen.findByText(/Canned responses are switched off for this helpline/)).toBeTruthy();
    const responses = usnm.files['CannedResponses.json'] as { label: string; text: string }[];
    fireEvent.change(screen.getByRole('combobox', { name: 'Canned Responses' }), {
      target: { value: responses[0].text },
    });
    expect(screen.getByText(responses[0].text)).toBeTruthy();
  });

  test('Save and End checks required answers and marks the tabs that need attention', async () => {
    renderDesktop(usnm);
    fireEvent.click(await screen.findByRole('tab', { name: 'Resources Shared' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save and End' }));

    expect(screen.getByText(/Aselo wouldn't save it yet/)).toBeTruthy();
    // Nothing was ticked on the categories tab, so it's marked
    expect(
      within(screen.getByRole('tab', { name: /Need\/Problem/ })).getByLabelText('Needs attention'),
    ).toBeTruthy();

    const requiredSummaryFields = formOf(usnm, 'CaseInformationTab').filter(
      (item) => typeof item.required === 'object' && item.required?.value,
    );
    if (requiredSummaryFields.length > 0) {
      expect(screen.getAllByText('This field is required.').length).toBeGreaterThan(0);
    }
  });

  test('a linked dropdown stays faded until the one above is answered', async () => {
    renderDesktop(demo, 'ChildInformationTab');
    const child = formOf(demo, 'ChildInformationTab');
    const province = child.find((item) => item.name === 'province')!;
    const district = child.find((item) => item.name === 'district')!;

    const districtSelect = (await screen.findByLabelText(
      labelled(district.label),
    )) as HTMLSelectElement;
    expect(districtSelect.disabled).toBe(true);

    const provinceSelect = screen.getByLabelText(labelled(province.label)) as HTMLSelectElement;
    const firstProvince = [...provinceSelect.options].find((option) => option.value)!.value;
    fireEvent.change(provinceSelect, { target: { value: firstProvince } });
    expect(districtSelect.disabled).toBe(false);
    expect(districtSelect.options.length).toBeGreaterThan(1);
  });

  test('“Yes / No / Unknown” checkboxes cycle through their three answers', async () => {
    renderDesktop(demo, 'CaseInformationTab');
    // One without initialChecked, so it starts unanswered
    const mixed = formOf(demo, 'CaseInformationTab').find(
      (item) => item.type === 'mixed-checkbox' && item.initialChecked === undefined,
    )!;
    const box = await screen.findByRole('checkbox', { name: mixed.label });
    expect(box.getAttribute('aria-checked')).toBe('mixed');
    fireEvent.click(box);
    expect(box.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(box);
    expect(box.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(box);
    expect(box.getAttribute('aria-checked')).toBe('mixed');
  });

  test('a checkbox set to start ticked starts ticked, as in Aselo', async () => {
    renderDesktop(demo, 'CaseInformationTab');
    const preTicked = formOf(demo, 'CaseInformationTab').find(
      (item) => item.type === 'mixed-checkbox' && item.initialChecked === true,
    )!;
    const box = await screen.findByRole('checkbox', { name: preTicked.label });
    expect(box.getAttribute('aria-checked')).toBe('true');
  });

  test('“Back to editing” closes the preview', async () => {
    const onClose = vi.fn();
    renderDesktop(usnm, undefined, onClose);
    fireEvent.click(await screen.findByRole('button', { name: 'Back to editing' }));
    expect(onClose).toHaveBeenCalled();
  });
});
